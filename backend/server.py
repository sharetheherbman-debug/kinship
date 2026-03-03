from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import socketio
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import httpx
import secrets
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'amarktai-network-secret-key-2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 72

# OpenAI Config
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

# Twilio Config (for SMS phone tracking invites)
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '')

# App URL (used for SMS links and Stripe redirects)
APP_URL = os.environ.get('APP_URL', 'http://localhost:3000')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
fastapi_app = FastAPI(title="Amarktai Network API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# =============================================================================
# PRICING & CURRENCY CONFIG
# =============================================================================
BASE_PRICE_ZAR = 49.0  # R49 per month for up to 10 members
EXTRA_MEMBERS_PRICE_ZAR = 19.0  # R19 per 5 additional members

# Exchange rates (will be fetched dynamically)
EXCHANGE_RATES = {
    'ZAR': 1.0,
    'USD': 0.055,  # 1 ZAR = 0.055 USD approx
    'GBP': 0.043,  # 1 ZAR = 0.043 GBP approx
    'EUR': 0.050,  # 1 ZAR = 0.050 EUR approx
    'AUD': 0.083,  # 1 ZAR = 0.083 AUD approx
}

CURRENCY_SYMBOLS = {
    'ZAR': 'R',
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'AUD': 'A$',
}

def convert_price(amount_zar: float, to_currency: str) -> float:
    """Convert ZAR to target currency and round nicely"""
    rate = EXCHANGE_RATES.get(to_currency, EXCHANGE_RATES['USD'])
    converted = amount_zar * rate
    # Round to nice numbers
    if converted < 1:
        return round(converted, 2)
    elif converted < 10:
        return round(converted * 2) / 2  # Round to nearest 0.50
    else:
        return round(converted)

# =============================================================================
# MODELS
# =============================================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    country: Optional[str] = "ZA"
    currency: Optional[str] = "ZAR"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    family_id: Optional[str] = None
    role: str = "member"
    country: str = "ZA"
    currency: str = "ZAR"
    created_at: str

class FamilyCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class FamilyResponse(BaseModel):
    id: str
    name: str
    description: str
    admin_id: str
    members: List[str]
    invite_code: str
    created_at: str

class FamilyInvite(BaseModel):
    invite_code: str

class TripCreate(BaseModel):
    name: str
    destination: str
    start_date: str
    end_date: str
    description: Optional[str] = ""
    budget: Optional[float] = 0
    currency: Optional[str] = "ZAR"

class TripResponse(BaseModel):
    id: str
    family_id: str
    name: str
    destination: str
    start_date: str
    end_date: str
    description: str
    budget: float
    currency: str
    itinerary: List[Dict[str, Any]]
    packing_list: List[Dict[str, Any]]
    created_by: str
    created_at: str

class ItineraryItem(BaseModel):
    trip_id: str
    day: int
    time: str
    activity: str
    location: Optional[str] = ""
    notes: Optional[str] = ""

class PackingItem(BaseModel):
    trip_id: str
    item: str
    category: str
    assigned_to: Optional[str] = ""
    packed: bool = False

class ChatMessage(BaseModel):
    family_id: str
    content: str

class ChatMessageResponse(BaseModel):
    id: str
    family_id: str
    user_id: str
    user_name: str
    content: str
    timestamp: str

class AIRequest(BaseModel):
    prompt: str
    context: Optional[str] = ""

class BudgetItem(BaseModel):
    trip_id: str
    category: str
    description: str
    amount: float
    currency: str = "ZAR"
    paid_by: Optional[str] = ""

class ExpenseSplit(BaseModel):
    trip_id: str
    expense_id: str
    split_between: List[str]  # List of user IDs

class MilestoneCreate(BaseModel):
    family_id: str
    title: str
    date: str
    type: str  # birthday, anniversary, travel_anniversary
    member_id: Optional[str] = ""

class DocumentCreate(BaseModel):
    family_id: str
    member_id: str
    doc_type: str  # passport, visa, id, insurance
    doc_number: str
    expiry_date: str
    country: Optional[str] = ""

class LocationUpdate(BaseModel):
    family_id: str
    latitude: float
    longitude: float
    accuracy: Optional[float] = 0
    battery_level: Optional[int] = 100

class TrackingSettings(BaseModel):
    enabled: bool = False
    share_with_family: bool = True
    share_with_members: List[str] = []
    geofence_alerts: bool = False
    geofence_locations: List[Dict[str, Any]] = []

class CheckoutRequest(BaseModel):
    plan: str
    origin_url: str
    currency: str = "ZAR"

class PhoneTrackingInvite(BaseModel):
    phone_number: str  # E.164 format e.g. +27821234567
    member_name: Optional[str] = ""
    family_id: str

class PhoneLocationUpdate(BaseModel):
    token: str
    latitude: float
    longitude: float
    accuracy: Optional[float] = 0
    battery_level: Optional[int] = 100

# =============================================================================
# AUTH HELPERS
# =============================================================================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# =============================================================================
# PRICING ROUTES
# =============================================================================

@api_router.get("/pricing")
async def get_pricing(currency: str = "ZAR"):
    """Get pricing in user's currency"""
    base_price = convert_price(BASE_PRICE_ZAR, currency)
    extra_price = convert_price(EXTRA_MEMBERS_PRICE_ZAR, currency)
    symbol = CURRENCY_SYMBOLS.get(currency, currency)
    
    return {
        'currency': currency,
        'symbol': symbol,
        'base_plan': {
            'name': 'Family Plan',
            'price': base_price,
            'formatted': f"{symbol}{base_price}",
            'period': 'month',
            'members_included': 10,
            'description': f'Up to 10 family members'
        },
        'extra_members': {
            'price': extra_price,
            'formatted': f"{symbol}{extra_price}",
            'per': 5,
            'description': f'Per 5 additional members/month'
        },
        'features': [
            'Unlimited trips',
            'Real-time family chat',
            'AI trip planning',
            'Location tracking',
            'Document vault',
            'Expense splitting',
            'Weather forecasts',
            'Milestone reminders'
        ]
    }

@api_router.get("/currencies")
async def get_currencies():
    """Get supported currencies"""
    return {
        'currencies': [
            {'code': 'ZAR', 'name': 'South African Rand', 'symbol': 'R'},
            {'code': 'USD', 'name': 'US Dollar', 'symbol': '$'},
            {'code': 'GBP', 'name': 'British Pound', 'symbol': '£'},
            {'code': 'EUR', 'name': 'Euro', 'symbol': '€'},
            {'code': 'AUD', 'name': 'Australian Dollar', 'symbol': 'A$'},
        ]
    }

# =============================================================================
# AUTH ROUTES
# =============================================================================

@api_router.post("/auth/register")
async def register(data: UserCreate):
    existing = await db.users.find_one({'email': data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        'id': user_id,
        'email': data.email,
        'password': hash_password(data.password),
        'name': data.name,
        'family_id': None,
        'role': 'member',
        'country': data.country or 'ZA',
        'currency': data.currency or 'ZAR',
        'tracking_settings': {'enabled': False, 'share_with_family': True},
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    token = create_token(user_id, data.email)
    return {
        'token': token,
        'user': {
            'id': user_id,
            'email': data.email,
            'name': data.name,
            'family_id': None,
            'role': 'member',
            'country': data.country or 'ZA',
            'currency': data.currency or 'ZAR'
        }
    }

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({'email': data.email}, {'_id': 0})
    if not user or not verify_password(data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], data.email)
    return {
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'family_id': user.get('family_id'),
            'role': user.get('role', 'member'),
            'country': user.get('country', 'ZA'),
            'currency': user.get('currency', 'ZAR'),
            'subscription': user.get('subscription', {'active': False})
        }
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        'id': user['id'],
        'email': user['email'],
        'name': user['name'],
        'family_id': user.get('family_id'),
        'role': user.get('role', 'member'),
        'country': user.get('country', 'ZA'),
        'currency': user.get('currency', 'ZAR'),
        'subscription': user.get('subscription', {'active': False})
    }

@api_router.put("/auth/settings")
async def update_user_settings(currency: str = None, country: str = None, user: dict = Depends(get_current_user)):
    updates = {}
    if currency:
        updates['currency'] = currency
    if country:
        updates['country'] = country
    
    if updates:
        await db.users.update_one({'id': user['id']}, {'$set': updates})
    
    return {'message': 'Settings updated'}

# =============================================================================
# FAMILY ROUTES
# =============================================================================

@api_router.post("/families")
async def create_family(data: FamilyCreate, user: dict = Depends(get_current_user)):
    family_id = str(uuid.uuid4())
    invite_code = str(uuid.uuid4())[:8].upper()
    
    family = {
        'id': family_id,
        'name': data.name,
        'description': data.description or "",
        'admin_id': user['id'],
        'members': [user['id']],
        'invite_code': invite_code,
        'member_count': 1,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.families.insert_one(family)
    
    await db.users.update_one(
        {'id': user['id']},
        {'$set': {'family_id': family_id, 'role': 'admin'}}
    )
    
    return {
        'id': family_id,
        'name': data.name,
        'description': data.description or "",
        'admin_id': user['id'],
        'members': [user['id']],
        'invite_code': invite_code
    }

@api_router.post("/families/join")
async def join_family(data: FamilyInvite, user: dict = Depends(get_current_user)):
    family = await db.families.find_one({'invite_code': data.invite_code.upper()}, {'_id': 0})
    if not family:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    
    if user['id'] in family['members']:
        raise HTTPException(status_code=400, detail="Already a member of this family")
    
    await db.families.update_one(
        {'id': family['id']},
        {'$push': {'members': user['id']}, '$inc': {'member_count': 1}}
    )
    await db.users.update_one(
        {'id': user['id']},
        {'$set': {'family_id': family['id'], 'role': 'member'}}
    )
    
    return {'message': 'Successfully joined family', 'family_id': family['id']}

@api_router.get("/families/my")
async def get_my_family(user: dict = Depends(get_current_user)):
    if not user.get('family_id'):
        return None
    
    family = await db.families.find_one({'id': user['family_id']}, {'_id': 0})
    if not family:
        return None
    
    members = await db.users.find(
        {'id': {'$in': family['members']}},
        {'_id': 0, 'password': 0}
    ).to_list(100)
    
    return {
        **family,
        'member_details': members
    }

@api_router.get("/families/{family_id}/members")
async def get_family_members(family_id: str, user: dict = Depends(get_current_user)):
    family = await db.families.find_one({'id': family_id}, {'_id': 0})
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    
    members = await db.users.find(
        {'id': {'$in': family['members']}},
        {'_id': 0, 'password': 0}
    ).to_list(100)
    
    return members

# =============================================================================
# TRIP ROUTES
# =============================================================================

@api_router.post("/trips")
async def create_trip(data: TripCreate, user: dict = Depends(get_current_user)):
    if not user.get('family_id'):
        raise HTTPException(status_code=400, detail="You must be part of a family to create trips")
    
    trip_id = str(uuid.uuid4())
    trip = {
        'id': trip_id,
        'family_id': user['family_id'],
        'name': data.name,
        'destination': data.destination,
        'start_date': data.start_date,
        'end_date': data.end_date,
        'description': data.description or "",
        'budget': data.budget or 0,
        'currency': data.currency or user.get('currency', 'ZAR'),
        'itinerary': [],
        'packing_list': [],
        'expenses': [],
        'created_by': user['id'],
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.trips.insert_one(trip)
    
    trip_response = {k: v for k, v in trip.items() if k != '_id'}
    return trip_response

@api_router.get("/trips")
async def get_trips(user: dict = Depends(get_current_user)):
    if not user.get('family_id'):
        return []
    
    trips = await db.trips.find({'family_id': user['family_id']}, {'_id': 0}).to_list(100)
    return trips

@api_router.get("/trips/{trip_id}")
async def get_trip(trip_id: str, user: dict = Depends(get_current_user)):
    trip = await db.trips.find_one({'id': trip_id}, {'_id': 0})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@api_router.put("/trips/{trip_id}")
async def update_trip(trip_id: str, data: TripCreate, user: dict = Depends(get_current_user)):
    trip = await db.trips.find_one({'id': trip_id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    await db.trips.update_one(
        {'id': trip_id},
        {'$set': {
            'name': data.name,
            'destination': data.destination,
            'start_date': data.start_date,
            'end_date': data.end_date,
            'description': data.description or "",
            'budget': data.budget or 0,
            'currency': data.currency or 'ZAR'
        }}
    )
    
    updated = await db.trips.find_one({'id': trip_id}, {'_id': 0})
    return updated

@api_router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: str, user: dict = Depends(get_current_user)):
    result = await db.trips.delete_one({'id': trip_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {'message': 'Trip deleted'}

# Itinerary endpoints
@api_router.post("/trips/{trip_id}/itinerary")
async def add_itinerary_item(trip_id: str, data: ItineraryItem, user: dict = Depends(get_current_user)):
    item = {
        'id': str(uuid.uuid4()),
        'day': data.day,
        'time': data.time,
        'activity': data.activity,
        'location': data.location or "",
        'notes': data.notes or ""
    }
    await db.trips.update_one({'id': trip_id}, {'$push': {'itinerary': item}})
    
    trip = await db.trips.find_one({'id': trip_id}, {'_id': 0})
    await sio.emit('trip_update', {'trip_id': trip_id, 'trip': trip}, room=trip['family_id'])
    
    return item

@api_router.delete("/trips/{trip_id}/itinerary/{item_id}")
async def delete_itinerary_item(trip_id: str, item_id: str, user: dict = Depends(get_current_user)):
    await db.trips.update_one(
        {'id': trip_id},
        {'$pull': {'itinerary': {'id': item_id}}}
    )
    return {'message': 'Itinerary item deleted'}

# Packing list endpoints
@api_router.post("/trips/{trip_id}/packing")
async def add_packing_item(trip_id: str, data: PackingItem, user: dict = Depends(get_current_user)):
    item = {
        'id': str(uuid.uuid4()),
        'item': data.item,
        'category': data.category,
        'assigned_to': data.assigned_to or "",
        'packed': data.packed
    }
    await db.trips.update_one({'id': trip_id}, {'$push': {'packing_list': item}})
    return item

@api_router.put("/trips/{trip_id}/packing/{item_id}")
async def toggle_packing_item(trip_id: str, item_id: str, user: dict = Depends(get_current_user)):
    trip = await db.trips.find_one({'id': trip_id})
    if trip:
        for item in trip.get('packing_list', []):
            if item['id'] == item_id:
                item['packed'] = not item['packed']
                break
        await db.trips.update_one({'id': trip_id}, {'$set': {'packing_list': trip['packing_list']}})
    return {'message': 'Item toggled'}

# =============================================================================
# BUDGET & EXPENSE SPLITTING ROUTES
# =============================================================================

@api_router.post("/trips/{trip_id}/budget")
async def add_budget_item(trip_id: str, data: BudgetItem, user: dict = Depends(get_current_user)):
    item = {
        'id': str(uuid.uuid4()),
        'trip_id': trip_id,
        'category': data.category,
        'description': data.description,
        'amount': data.amount,
        'currency': data.currency,
        'paid_by': data.paid_by or user['id'],
        'paid_by_name': user['name'],
        'split_between': [],
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.budget_items.insert_one(item)
    
    item_response = {k: v for k, v in item.items() if k != '_id'}
    return item_response

@api_router.get("/trips/{trip_id}/budget")
async def get_budget_items(trip_id: str, user: dict = Depends(get_current_user)):
    items = await db.budget_items.find({'trip_id': trip_id}, {'_id': 0}).to_list(500)
    return items

@api_router.post("/trips/{trip_id}/budget/{expense_id}/split")
async def split_expense(trip_id: str, expense_id: str, data: ExpenseSplit, user: dict = Depends(get_current_user)):
    """Split an expense between family members"""
    await db.budget_items.update_one(
        {'id': expense_id},
        {'$set': {'split_between': data.split_between}}
    )
    return {'message': 'Expense split updated'}

@api_router.get("/trips/{trip_id}/budget/summary")
async def get_budget_summary(trip_id: str, user: dict = Depends(get_current_user)):
    """Get expense summary with who owes who"""
    items = await db.budget_items.find({'trip_id': trip_id}, {'_id': 0}).to_list(500)
    
    # Calculate totals per person
    paid_by = {}
    owes = {}
    
    for item in items:
        payer = item.get('paid_by')
        amount = item.get('amount', 0)
        split = item.get('split_between', [])
        
        if payer:
            paid_by[payer] = paid_by.get(payer, 0) + amount
        
        if split:
            split_amount = amount / len(split)
            for member in split:
                if member != payer:
                    owes[member] = owes.get(member, 0) + split_amount
    
    return {
        'total_spent': sum(item.get('amount', 0) for item in items),
        'paid_by': paid_by,
        'owes': owes,
        'items': items
    }

# =============================================================================
# MILESTONES ROUTES
# =============================================================================

@api_router.post("/milestones")
async def create_milestone(data: MilestoneCreate, user: dict = Depends(get_current_user)):
    milestone = {
        'id': str(uuid.uuid4()),
        'family_id': data.family_id,
        'title': data.title,
        'date': data.date,
        'type': data.type,
        'member_id': data.member_id or "",
        'created_by': user['id'],
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.milestones.insert_one(milestone)
    
    response = {k: v for k, v in milestone.items() if k != '_id'}
    return response

@api_router.get("/milestones/{family_id}")
async def get_milestones(family_id: str, user: dict = Depends(get_current_user)):
    milestones = await db.milestones.find({'family_id': family_id}, {'_id': 0}).to_list(100)
    return milestones

@api_router.get("/milestones/{family_id}/upcoming")
async def get_upcoming_milestones(family_id: str, user: dict = Depends(get_current_user)):
    """Get milestones in the next 30 days"""
    today = datetime.now(timezone.utc)
    thirty_days = today + timedelta(days=30)
    
    milestones = await db.milestones.find({'family_id': family_id}, {'_id': 0}).to_list(100)
    
    upcoming = []
    for m in milestones:
        try:
            m_date = datetime.fromisoformat(m['date'].replace('Z', '+00:00'))
            # For recurring events (birthdays), check this year
            this_year_date = m_date.replace(year=today.year)
            if today <= this_year_date <= thirty_days:
                upcoming.append({**m, 'upcoming_date': this_year_date.isoformat()})
        except:
            pass
    
    return sorted(upcoming, key=lambda x: x.get('upcoming_date', ''))

# =============================================================================
# DOCUMENT VAULT ROUTES
# =============================================================================

@api_router.post("/documents")
async def create_document(data: DocumentCreate, user: dict = Depends(get_current_user)):
    doc = {
        'id': str(uuid.uuid4()),
        'family_id': data.family_id,
        'member_id': data.member_id,
        'doc_type': data.doc_type,
        'doc_number': data.doc_number[-4:],  # Only store last 4 chars for security
        'expiry_date': data.expiry_date,
        'country': data.country or "",
        'created_by': user['id'],
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.documents.insert_one(doc)
    
    response = {k: v for k, v in doc.items() if k != '_id'}
    return response

@api_router.get("/documents/{family_id}")
async def get_documents(family_id: str, user: dict = Depends(get_current_user)):
    docs = await db.documents.find({'family_id': family_id}, {'_id': 0}).to_list(100)
    return docs

@api_router.get("/documents/{family_id}/expiring")
async def get_expiring_documents(family_id: str, user: dict = Depends(get_current_user)):
    """Get documents expiring in the next 90 days"""
    today = datetime.now(timezone.utc)
    ninety_days = today + timedelta(days=90)
    
    docs = await db.documents.find({'family_id': family_id}, {'_id': 0}).to_list(100)
    
    expiring = []
    for doc in docs:
        try:
            exp_date = datetime.fromisoformat(doc['expiry_date'].replace('Z', '+00:00'))
            if exp_date <= ninety_days:
                days_until = (exp_date - today).days
                expiring.append({**doc, 'days_until_expiry': days_until})
        except:
            pass
    
    return sorted(expiring, key=lambda x: x.get('days_until_expiry', 999))

# =============================================================================
# LOCATION TRACKING ROUTES
# =============================================================================

@api_router.put("/tracking/settings")
async def update_tracking_settings(data: TrackingSettings, user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {'id': user['id']},
        {'$set': {'tracking_settings': data.model_dump()}}
    )
    return {'message': 'Tracking settings updated'}

@api_router.get("/tracking/settings")
async def get_tracking_settings(user: dict = Depends(get_current_user)):
    return user.get('tracking_settings', {'enabled': False, 'share_with_family': True})

@api_router.post("/tracking/location")
async def update_location(data: LocationUpdate, user: dict = Depends(get_current_user)):
    """Update user's current location"""
    location = {
        'id': str(uuid.uuid4()),
        'user_id': user['id'],
        'family_id': data.family_id,
        'latitude': data.latitude,
        'longitude': data.longitude,
        'accuracy': data.accuracy,
        'battery_level': data.battery_level,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }
    
    # Update current location
    await db.locations.update_one(
        {'user_id': user['id']},
        {'$set': location},
        upsert=True
    )
    
    # Add to history
    await db.location_history.insert_one(location)
    
    # Broadcast to family
    await sio.emit('location_update', {
        'user_id': user['id'],
        'user_name': user['name'],
        'latitude': data.latitude,
        'longitude': data.longitude,
        'timestamp': location['timestamp']
    }, room=data.family_id)
    
    return {'message': 'Location updated'}

@api_router.get("/tracking/family/{family_id}")
async def get_family_locations(family_id: str, user: dict = Depends(get_current_user)):
    """Get current locations of all family members who have sharing enabled"""
    family = await db.families.find_one({'id': family_id}, {'_id': 0})
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    
    # Get members with tracking enabled
    members = await db.users.find(
        {'id': {'$in': family['members']}, 'tracking_settings.enabled': True},
        {'_id': 0, 'password': 0}
    ).to_list(100)
    
    member_ids = [m['id'] for m in members]
    
    locations = await db.locations.find(
        {'user_id': {'$in': member_ids}},
        {'_id': 0}
    ).to_list(100)
    
    # Combine member info with locations
    result = []
    for loc in locations:
        member = next((m for m in members if m['id'] == loc['user_id']), None)
        if member:
            result.append({
                **loc,
                'user_name': member['name'],
                'user_email': member['email']
            })
    
    return result

@api_router.get("/tracking/history/{user_id}")
async def get_location_history(user_id: str, days: int = 7, user: dict = Depends(get_current_user)):
    """Get location history for a user"""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    
    history = await db.location_history.find(
        {'user_id': user_id, 'timestamp': {'$gte': since.isoformat()}},
        {'_id': 0}
    ).sort('timestamp', -1).to_list(1000)
    
    return history

# =============================================================================
# PHONE TRACKING ROUTES (SMS consent-based)
# =============================================================================

async def send_tracking_sms(phone_number: str, approval_link: str, family_name: str, inviter_name: str) -> bool:
    """Send SMS invite for location tracking consent via Twilio"""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_PHONE_NUMBER:
        logger.warning("Twilio not configured – SMS not sent")
        return False
    try:
        from twilio.rest import Client as TwilioClient
        twilio_client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = twilio_client.messages.create(
            body=(
                f"Hi! {inviter_name} from the '{family_name}' family on Amarktai Network "
                f"would like to track your location. "
                f"Tap the link to approve: {approval_link} "
                f"(You can stop sharing at any time.)"
            ),
            from_=TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        logger.info(f"SMS sent to {phone_number}: SID {message.sid}")
        return True
    except Exception as e:
        logger.error(f"Twilio SMS error: {str(e)}")
        return False


@api_router.post("/tracking/phone/invite")
async def invite_phone_tracking(data: PhoneTrackingInvite, user: dict = Depends(get_current_user)):
    """Send an SMS to a phone number asking them to consent to location sharing"""
    # Verify user belongs to the family
    if user.get('family_id') != data.family_id:
        raise HTTPException(status_code=403, detail="You are not a member of this family")

    family = await db.families.find_one({'id': data.family_id}, {'_id': 0})
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    # Check if an invite already exists for this phone+family
    existing = await db.phone_tracking.find_one(
        {'phone_number': data.phone_number, 'family_id': data.family_id},
        {'_id': 0}
    )
    if existing and existing.get('approved'):
        return {'message': 'Phone is already approved for tracking', 'token': existing['token']}

    # Generate a secure token
    token = secrets.token_urlsafe(32)
    approval_link = f"{APP_URL}/tracking/phone/approve/{token}"

    record = {
        'id': str(uuid.uuid4()),
        'token': token,
        'phone_number': data.phone_number,
        'member_name': data.member_name or data.phone_number,
        'family_id': data.family_id,
        'invited_by': user['id'],
        'approved': False,
        'active': False,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'approved_at': None,
        'last_location': None
    }

    # Upsert by phone+family
    await db.phone_tracking.update_one(
        {'phone_number': data.phone_number, 'family_id': data.family_id},
        {'$set': record},
        upsert=True
    )

    sms_sent = await send_tracking_sms(
        data.phone_number, approval_link,
        family['name'], user['name']
    )

    return {
        'message': 'Invite created' + (' and SMS sent' if sms_sent else ' (SMS not configured)'),
        'token': token,
        'approval_link': approval_link,
        'sms_sent': sms_sent
    }


@api_router.get("/tracking/phone/approve/{token}")
async def phone_tracking_info(token: str):
    """Get info about a phone tracking invite (public – no auth required)"""
    record = await db.phone_tracking.find_one({'token': token}, {'_id': 0})
    if not record:
        raise HTTPException(status_code=404, detail="Invalid or expired tracking link")

    family = await db.families.find_one({'id': record['family_id']}, {'_id': 0})
    inviter = await db.users.find_one({'id': record['invited_by']}, {'_id': 0, 'password': 0})

    return {
        'token': token,
        'family_name': family['name'] if family else 'Unknown',
        'inviter_name': inviter['name'] if inviter else 'A family member',
        'phone_number': record['phone_number'],
        'approved': record['approved'],
        'active': record['active']
    }


@api_router.post("/tracking/phone/approve/{token}")
async def approve_phone_tracking(token: str):
    """Approve location sharing consent for a phone (public – no auth required)"""
    record = await db.phone_tracking.find_one({'token': token}, {'_id': 0})
    if not record:
        raise HTTPException(status_code=404, detail="Invalid or expired tracking link")

    await db.phone_tracking.update_one(
        {'token': token},
        {'$set': {
            'approved': True,
            'active': True,
            'approved_at': datetime.now(timezone.utc).isoformat()
        }}
    )
    return {'message': 'Location sharing approved', 'token': token}


@api_router.post("/tracking/phone/revoke/{token}")
async def revoke_phone_tracking(token: str):
    """Revoke consent – can be called by phone user or family admin"""
    record = await db.phone_tracking.find_one({'token': token}, {'_id': 0})
    if not record:
        raise HTTPException(status_code=404, detail="Invalid tracking token")

    await db.phone_tracking.update_one(
        {'token': token},
        {'$set': {'active': False}}
    )
    return {'message': 'Location sharing stopped'}


@api_router.post("/tracking/phone/location")
async def update_phone_location(data: PhoneLocationUpdate):
    """Phone submits its GPS location (authenticated by token only)"""
    record = await db.phone_tracking.find_one({'token': data.token}, {'_id': 0})
    if not record:
        raise HTTPException(status_code=404, detail="Invalid tracking token")
    if not record.get('approved') or not record.get('active'):
        raise HTTPException(status_code=403, detail="Location sharing not approved or disabled")

    location = {
        'id': str(uuid.uuid4()),
        'phone_number': record['phone_number'],
        'member_name': record['member_name'],
        'family_id': record['family_id'],
        'latitude': data.latitude,
        'longitude': data.longitude,
        'accuracy': data.accuracy,
        'battery_level': data.battery_level,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'source': 'phone'
    }

    # Store latest location on the phone_tracking record
    await db.phone_tracking.update_one(
        {'token': data.token},
        {'$set': {'last_location': location}}
    )

    # Also add to location history for the family
    await db.location_history.insert_one(location)

    # Broadcast to family room
    await sio.emit('phone_location_update', {
        'phone_number': record['phone_number'],
        'member_name': record['member_name'],
        'latitude': data.latitude,
        'longitude': data.longitude,
        'timestamp': location['timestamp']
    }, room=record['family_id'])

    return {'message': 'Location updated'}


@api_router.get("/tracking/phones/{family_id}")
async def get_phone_trackers(family_id: str, user: dict = Depends(get_current_user)):
    """Get all phone trackers for a family"""
    if user.get('family_id') != family_id:
        raise HTTPException(status_code=403, detail="Not a member of this family")

    phones = await db.phone_tracking.find(
        {'family_id': family_id},
        {'_id': 0, 'token': 0}  # hide token from list view
    ).to_list(100)
    return phones


@api_router.delete("/tracking/phones/{phone_id}")
async def delete_phone_tracker(phone_id: str, user: dict = Depends(get_current_user)):
    """Delete a phone tracking record (admin only)"""
    record = await db.phone_tracking.find_one({'id': phone_id}, {'_id': 0})
    if not record:
        raise HTTPException(status_code=404, detail="Phone tracker not found")

    family = await db.families.find_one({'id': record['family_id']}, {'_id': 0})
    is_family_admin = family and family.get('admin_id') == user['id']
    is_inviter = record.get('invited_by') == user['id']
    if not (is_family_admin or is_inviter):
        raise HTTPException(status_code=403, detail="Only family admin can remove phone trackers")

    await db.phone_tracking.delete_one({'id': phone_id})
    return {'message': 'Phone tracker removed'}


# =============================================================================
# WEATHER ROUTES
# =============================================================================

@api_router.get("/weather/{destination}")
async def get_weather(destination: str, user: dict = Depends(get_current_user)):
    """Get weather forecast for a destination (using free API)"""
    try:
        async with httpx.AsyncClient() as client:
            # Using wttr.in free API
            response = await client.get(
                f"https://wttr.in/{destination}?format=j1",
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                current = data.get('current_condition', [{}])[0]
                forecast = data.get('weather', [])[:5]
                
                return {
                    'destination': destination,
                    'current': {
                        'temp_c': current.get('temp_C'),
                        'temp_f': current.get('temp_F'),
                        'condition': current.get('weatherDesc', [{}])[0].get('value'),
                        'humidity': current.get('humidity'),
                        'wind_kph': current.get('windspeedKmph')
                    },
                    'forecast': [{
                        'date': day.get('date'),
                        'max_c': day.get('maxtempC'),
                        'min_c': day.get('mintempC'),
                        'condition': day.get('hourly', [{}])[4].get('weatherDesc', [{}])[0].get('value', '')
                    } for day in forecast]
                }
    except Exception as e:
        logger.error(f"Weather API error: {str(e)}")
    
    return {'destination': destination, 'error': 'Weather data unavailable'}

# =============================================================================
# CHAT ROUTES
# =============================================================================

@api_router.post("/chat/send")
async def send_message(data: ChatMessage, user: dict = Depends(get_current_user)):
    message = {
        'id': str(uuid.uuid4()),
        'family_id': data.family_id,
        'user_id': user['id'],
        'user_name': user['name'],
        'content': data.content,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(message)
    
    broadcast_msg = {k: v for k, v in message.items() if k != '_id'}
    await sio.emit('new_message', broadcast_msg, room=data.family_id)
    
    return broadcast_msg

@api_router.get("/chat/{family_id}")
async def get_messages(family_id: str, user: dict = Depends(get_current_user)):
    messages = await db.messages.find(
        {'family_id': family_id},
        {'_id': 0}
    ).sort('timestamp', -1).limit(100).to_list(100)
    return list(reversed(messages))

# =============================================================================
# AI ASSISTANT ROUTES
# =============================================================================

@api_router.post("/ai/chat")
async def ai_chat(data: AIRequest, user: dict = Depends(get_current_user)):
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    system_prompt = """You are Amarktai AI, a friendly family travel assistant for the Amarktai Network app. 
    Help families plan trips, suggest activities, create itineraries, recommend destinations, and provide travel tips.
    Be warm, helpful, and considerate of family dynamics. Consider kids, elders, and different preferences.
    Keep responses concise but informative."""
    
    if data.context:
        system_prompt += f"\n\nContext: {data.context}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": data.prompt}
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.7
                },
                timeout=60.0
            )
            
            if response.status_code != 200:
                logger.error(f"OpenAI API error: {response.text}")
                raise HTTPException(status_code=500, detail="AI service error")
            
            result = response.json()
            ai_response = result['choices'][0]['message']['content']
            
            return {'response': ai_response}
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI request timed out")
    except Exception as e:
        logger.error(f"AI chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/generate-itinerary")
async def generate_itinerary(trip_id: str, user: dict = Depends(get_current_user)):
    trip = await db.trips.find_one({'id': trip_id}, {'_id': 0})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    prompt = f"""Create a detailed day-by-day itinerary for a family trip to {trip['destination']} 
    from {trip['start_date']} to {trip['end_date']}.
    Trip description: {trip.get('description', 'Family vacation')}
    Budget: ${trip.get('budget', 'flexible')}
    
    Return a JSON array with objects containing: day (number), time (HH:MM), activity (string), location (string), notes (string)
    Include a mix of activities suitable for all ages. Only return valid JSON, no markdown."""
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4",
                    "messages": [
                        {"role": "system", "content": "You are a travel planning expert. Return only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 2000,
                    "temperature": 0.7
                },
                timeout=90.0
            )
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            import json
            try:
                if '```json' in content:
                    content = content.split('```json')[1].split('```')[0]
                elif '```' in content:
                    content = content.split('```')[1].split('```')[0]
                
                itinerary_items = json.loads(content.strip())
                
                for item in itinerary_items:
                    item['id'] = str(uuid.uuid4())
                
                await db.trips.update_one({'id': trip_id}, {'$set': {'itinerary': itinerary_items}})
                
                return {'itinerary': itinerary_items}
            except json.JSONDecodeError:
                return {'response': content}
                
    except Exception as e:
        logger.error(f"Itinerary generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# STRIPE PAYMENT ROUTES
# =============================================================================

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')

@api_router.post("/payments/checkout")
async def create_checkout(data: CheckoutRequest, user: dict = Depends(get_current_user)):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Payment system not configured")
    
    # Get pricing in user's currency
    price = convert_price(BASE_PRICE_ZAR, data.currency)
    
    try:
        success_url = f"{data.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{data.origin_url}/payment/cancel"

        # Stripe zero-decimal currencies must not be multiplied by 100
        ZERO_DECIMAL_CURRENCIES = {'bif', 'clp', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg',
                                    'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'}
        currency_lower = data.currency.lower()
        if currency_lower in ZERO_DECIMAL_CURRENCIES:
            unit_amount = int(round(float(price)))
        else:
            unit_amount = int(round(float(price) * 100))
        plan_name = "Amarktai Network Premium"

        form_data = {
            "mode": "payment",
            "success_url": success_url,
            "cancel_url": cancel_url,
            "line_items[0][price_data][currency]": currency_lower,
            "line_items[0][price_data][unit_amount]": str(unit_amount),
            "line_items[0][price_data][product_data][name]": plan_name,
            "line_items[0][quantity]": "1",
            "metadata[user_id]": user['id'],
            "metadata[plan]": data.plan,
            "metadata[original_currency]": data.currency,
        }

        async with httpx.AsyncClient() as client_http:
            resp = await client_http.post(
                "https://api.stripe.com/v1/checkout/sessions",
                data=form_data,
                auth=(STRIPE_API_KEY, ""),
                timeout=30,
            )
        try:
            resp_json = resp.json()
        except Exception:
            raise HTTPException(status_code=500, detail="Invalid response from payment provider")
        if resp.status_code != 200:
            raise HTTPException(status_code=500, detail=resp_json.get("error", {}).get("message", "Stripe error"))
        session = resp_json

        await db.payment_transactions.insert_one({
            'id': str(uuid.uuid4()),
            'session_id': session['id'],
            'user_id': user['id'],
            'amount': price,
            'currency': data.currency,
            'plan': data.plan,
            'status': 'pending',
            'created_at': datetime.now(timezone.utc).isoformat()
        })

        return {'url': session['url'], 'session_id': session['id']}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, user: dict = Depends(get_current_user)):
    try:
        async with httpx.AsyncClient() as client_http:
            resp = await client_http.get(
                f"https://api.stripe.com/v1/checkout/sessions/{session_id}",
                auth=(STRIPE_API_KEY, ""),
                timeout=30,
            )
        try:
            resp_json = resp.json()
        except Exception:
            raise HTTPException(status_code=500, detail="Invalid response from payment provider")
        if resp.status_code != 200:
            raise HTTPException(status_code=500, detail=resp_json.get("error", {}).get("message", "Stripe error"))
        session = resp_json

        payment_status = session.get('payment_status', 'unpaid')

        await db.payment_transactions.update_one(
            {'session_id': session_id},
            {'$set': {'status': payment_status, 'updated_at': datetime.now(timezone.utc).isoformat()}}
        )

        return {
            'status': session.get('status'),
            'payment_status': payment_status,
            'amount': session.get('amount_total', 0) / 100,
            'currency': session.get('currency')
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment status error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events to activate subscriptions"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature', '')

    # Verify webhook signature when secret is configured
    if STRIPE_WEBHOOK_SECRET:
        try:
            import hmac
            import hashlib
            # Parse timestamp + signature from header
            parts = {k: v for k, v in (p.split('=', 1) for p in sig_header.split(',') if '=' in p)}
            ts = parts.get('t', '')
            expected = hmac.new(
                STRIPE_WEBHOOK_SECRET.encode(),
                f"{ts}.".encode() + payload,
                hashlib.sha256
            ).hexdigest()
            v1_sigs = [v for k, v in parts.items() if k == 'v1']
            if not any(secrets.compare_digest(expected, sig) for sig in v1_sigs):
                raise HTTPException(status_code=400, detail="Invalid webhook signature")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Webhook signature verification error: {e}")
            raise HTTPException(status_code=400, detail="Webhook signature error")

    try:
        event = json.loads(payload)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get('type', '')
    logger.info(f"Stripe webhook event: {event_type}")

    if event_type == 'checkout.session.completed':
        session = event.get('data', {}).get('object', {})
        session_id = session.get('id')
        payment_status = session.get('payment_status')
        metadata = session.get('metadata', {})
        user_id = metadata.get('user_id')

        if payment_status == 'paid' and user_id and session_id:
            # Mark transaction as paid
            await db.payment_transactions.update_one(
                {'session_id': session_id},
                {'$set': {
                    'status': 'paid',
                    'updated_at': datetime.now(timezone.utc).isoformat()
                }}
            )
            # Activate subscription on user account
            await db.users.update_one(
                {'id': user_id},
                {'$set': {
                    'subscription': {
                        'active': True,
                        'plan': metadata.get('plan', 'family'),
                        'currency': metadata.get('original_currency', 'ZAR'),
                        'activated_at': datetime.now(timezone.utc).isoformat(),
                        'session_id': session_id
                    }
                }}
            )
            logger.info(f"Subscription activated for user {user_id}")

    elif event_type in ('customer.subscription.deleted', 'customer.subscription.paused'):
        # Deactivate subscription
        subscription = event.get('data', {}).get('object', {})
        customer_id = subscription.get('customer')
        if customer_id:
            await db.users.update_many(
                {'stripe_customer_id': customer_id},
                {'$set': {'subscription.active': False}}
            )

    return {'received': True}


# =============================================================================
# ADMIN ROUTES
# =============================================================================

ADMIN_SECRET = os.environ.get('ADMIN_SECRET', 'amarktai-admin-2024')

async def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if user.get('is_superadmin'):
        return user
    raise HTTPException(status_code=403, detail="Admin access required")

@api_router.get("/admin/users")
async def admin_get_users(user: dict = Depends(verify_admin)):
    users = await db.users.find({}, {'_id': 0, 'password': 0}).to_list(1000)
    return users

@api_router.get("/admin/families")
async def admin_get_families(user: dict = Depends(verify_admin)):
    families = await db.families.find({}, {'_id': 0}).to_list(1000)
    return families

@api_router.get("/admin/payments")
async def admin_get_payments(user: dict = Depends(verify_admin)):
    payments = await db.payment_transactions.find({}, {'_id': 0}).to_list(1000)
    return payments

@api_router.post("/admin/setup")
async def setup_admin(secret: str):
    if secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Invalid admin secret")
    
    admin = await db.users.find_one({'email': 'admin@amarktainetwork.com'})
    if admin:
        return {'message': 'Admin already exists'}
    
    admin_id = str(uuid.uuid4())
    admin_user = {
        'id': admin_id,
        'email': 'admin@amarktainetwork.com',
        'password': hash_password('AmarktaiAdmin2024!'),
        'name': 'Super Admin',
        'family_id': None,
        'role': 'superadmin',
        'is_superadmin': True,
        'country': 'ZA',
        'currency': 'ZAR',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_user)
    
    return {'message': 'Admin created', 'email': 'admin@amarktainetwork.com', 'password': 'AmarktaiAdmin2024!'}


# =============================================================================
# ADMIN CONFIG ROUTES (API key management for superadmin)
# =============================================================================

class AdminConfig(BaseModel):
    openai_api_key: Optional[str] = None
    stripe_api_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    app_url: Optional[str] = None

@api_router.get("/admin/config")
async def get_admin_config(user: dict = Depends(verify_admin)):
    """Get current runtime configuration (masked secrets)"""
    config = await db.admin_config.find_one({'_id': 'main'}, {'_id': 0})
    if not config:
        config = {}
    # Mask secret values - always use fixed mask regardless of length
    masked = {}
    SENSITIVE_KEYS = {'openai_api_key', 'stripe_api_key', 'stripe_webhook_secret', 'twilio_auth_token'}
    for k, v in config.items():
        if v and k in SENSITIVE_KEYS:
            masked[k] = '••••••••••••'
        else:
            masked[k] = v
    return masked

@api_router.post("/admin/config")
async def save_admin_config(config: AdminConfig, user: dict = Depends(verify_admin)):
    """Save runtime configuration (updates environment variables in memory)"""
    global OPENAI_API_KEY, STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET
    global TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, APP_URL

    update_doc = {k: v for k, v in config.dict().items() if v is not None}
    if not update_doc:
        raise HTTPException(status_code=400, detail="No values provided")

    await db.admin_config.update_one({'_id': 'main'}, {'$set': update_doc}, upsert=True)

    # Apply in-memory so they take effect without restart
    if config.openai_api_key:
        OPENAI_API_KEY = config.openai_api_key
        os.environ['OPENAI_API_KEY'] = config.openai_api_key
    if config.stripe_api_key:
        STRIPE_API_KEY = config.stripe_api_key
        os.environ['STRIPE_API_KEY'] = config.stripe_api_key
    if config.stripe_webhook_secret:
        STRIPE_WEBHOOK_SECRET = config.stripe_webhook_secret
        os.environ['STRIPE_WEBHOOK_SECRET'] = config.stripe_webhook_secret
    if config.twilio_account_sid:
        TWILIO_ACCOUNT_SID = config.twilio_account_sid
        os.environ['TWILIO_ACCOUNT_SID'] = config.twilio_account_sid
    if config.twilio_auth_token:
        TWILIO_AUTH_TOKEN = config.twilio_auth_token
        os.environ['TWILIO_AUTH_TOKEN'] = config.twilio_auth_token
    if config.twilio_phone_number:
        TWILIO_PHONE_NUMBER = config.twilio_phone_number
        os.environ['TWILIO_PHONE_NUMBER'] = config.twilio_phone_number
    if config.app_url:
        APP_URL = config.app_url
        os.environ['APP_URL'] = config.app_url

    return {'message': 'Configuration saved and applied'}

@api_router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(verify_admin)):
    """Return system stats for monitoring"""
    total_users = await db.users.count_documents({})
    total_families = await db.families.count_documents({})
    total_payments = await db.payment_transactions.count_documents({})
    paid_payments = await db.payment_transactions.count_documents({'status': 'paid'})
    return {
        'total_users': total_users,
        'total_families': total_families,
        'total_payments': total_payments,
        'paid_payments': paid_payments,
        'system': {
            'openai_configured': bool(OPENAI_API_KEY),
            'stripe_configured': bool(STRIPE_API_KEY),
            'twilio_configured': bool(TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN),
        }
    }


# =============================================================================
# SOCIAL MEDIA PROFILE ROUTES
# =============================================================================

class SocialProfile(BaseModel):
    platform: str  # facebook, instagram, twitter, linkedin
    profile_url: Optional[str] = None
    username: Optional[str] = None
    connected: Optional[bool] = False

@api_router.get("/user/social")
async def get_social_profiles(user: dict = Depends(get_current_user)):
    """Get user's linked social media profiles"""
    profiles = await db.social_profiles.find({'user_id': user['id']}, {'_id': 0}).to_list(100)
    return profiles

@api_router.post("/user/social")
async def save_social_profile(profile: SocialProfile, user: dict = Depends(get_current_user)):
    """Save or update a social media profile link"""
    await db.social_profiles.update_one(
        {'user_id': user['id'], 'platform': profile.platform},
        {'$set': {
            'user_id': user['id'],
            'platform': profile.platform,
            'profile_url': profile.profile_url,
            'username': profile.username,
            'connected': profile.connected,
            'updated_at': datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {'message': f'{profile.platform} profile saved'}

@api_router.delete("/user/social/{platform}")
async def delete_social_profile(platform: str, user: dict = Depends(get_current_user)):
    """Remove a social media profile link"""
    await db.social_profiles.delete_one({'user_id': user['id'], 'platform': platform})
    return {'message': f'{platform} profile removed'}


# =============================================================================
# NEWSLETTER & CONTACT FORM
# =============================================================================

class NewsletterRequest(BaseModel):
    email: str

class ContactRequest(BaseModel):
    name: str
    email: str
    subject: Optional[str] = None
    message: str

@api_router.post("/newsletter/subscribe")
async def newsletter_subscribe(data: NewsletterRequest):
    """Subscribe an email address to the newsletter"""
    email = data.email.strip().lower()
    if not email or '@' not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")
    existing = await db.newsletter_subscribers.find_one({'email': email})
    if existing:
        return {'message': 'Already subscribed'}
    await db.newsletter_subscribers.insert_one({
        'email': email,
        'subscribed_at': datetime.now(timezone.utc).isoformat(),
        'active': True
    })
    return {'message': 'Subscribed successfully'}

@api_router.post("/contact")
async def submit_contact(data: ContactRequest):
    """Save a contact form submission"""
    await db.contact_submissions.insert_one({
        'id': str(uuid.uuid4()),
        'name': data.name,
        'email': data.email,
        'subject': data.subject or 'General Enquiry',
        'message': data.message,
        'status': 'new',
        'submitted_at': datetime.now(timezone.utc).isoformat()
    })
    return {'message': 'Message received. We\'ll be in touch within 24 hours.'}

@api_router.get("/admin/newsletter")
async def get_newsletter_subscribers(user: dict = Depends(verify_admin)):
    """Get all newsletter subscribers (admin only)"""
    subs = await db.newsletter_subscribers.find({'active': True}, {'_id': 0}).to_list(5000)
    return {'count': len(subs), 'subscribers': subs}

@api_router.get("/admin/contact-submissions")
async def get_contact_submissions(user: dict = Depends(verify_admin)):
    """Get all contact form submissions (admin only)"""
    submissions = await db.contact_submissions.find({}, {'_id': 0}).sort('submitted_at', -1).to_list(500)
    return submissions

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def join_room(sid, data):
    room_id = data.get('room_id')
    if room_id:
        await sio.enter_room(sid, room_id)
        logger.info(f"Client {sid} joined room {room_id}")
        await sio.emit('room_joined', {'room_id': room_id}, room=sid)

@sio.event
async def leave_room(sid, data):
    room_id = data.get('room_id')
    if room_id:
        await sio.leave_room(sid, room_id)
        logger.info(f"Client {sid} left room {room_id}")

@sio.event
async def typing(sid, data):
    room_id = data.get('room_id')
    user_name = data.get('user_name')
    if room_id:
        await sio.emit('user_typing', {'user_name': user_name}, room=room_id, skip_sid=sid)

# =============================================================================
# HEALTH CHECK
# =============================================================================

@api_router.get("/")
async def root():
    return {"message": "Amarktai Network API", "version": "2.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router in the main app
fastapi_app.include_router(api_router)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@fastapi_app.on_event("startup")
async def load_persisted_config():
    """On startup, reload any admin-saved API keys from MongoDB into memory."""
    global OPENAI_API_KEY, STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET
    global TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, APP_URL
    try:
        config = await db.admin_config.find_one({'_id': 'main'})
        if config:
            if config.get('openai_api_key'):
                OPENAI_API_KEY = config['openai_api_key']
                os.environ['OPENAI_API_KEY'] = config['openai_api_key']
            if config.get('stripe_api_key'):
                STRIPE_API_KEY = config['stripe_api_key']
                os.environ['STRIPE_API_KEY'] = config['stripe_api_key']
            if config.get('stripe_webhook_secret'):
                STRIPE_WEBHOOK_SECRET = config['stripe_webhook_secret']
                os.environ['STRIPE_WEBHOOK_SECRET'] = config['stripe_webhook_secret']
            if config.get('twilio_account_sid'):
                TWILIO_ACCOUNT_SID = config['twilio_account_sid']
                os.environ['TWILIO_ACCOUNT_SID'] = config['twilio_account_sid']
            if config.get('twilio_auth_token'):
                TWILIO_AUTH_TOKEN = config['twilio_auth_token']
                os.environ['TWILIO_AUTH_TOKEN'] = config['twilio_auth_token']
            if config.get('twilio_phone_number'):
                TWILIO_PHONE_NUMBER = config['twilio_phone_number']
                os.environ['TWILIO_PHONE_NUMBER'] = config['twilio_phone_number']
            if config.get('app_url'):
                APP_URL = config['app_url']
                os.environ['APP_URL'] = config['app_url']
            logger.info("Loaded persisted admin config from database")
    except Exception as e:
        logger.warning(f"Could not load persisted config (DB may not be ready): {e}")

# Wrap FastAPI with Socket.IO
socket_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path='/api/socket.io')
app = socket_app

@fastapi_app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
