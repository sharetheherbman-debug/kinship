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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'kinship-journeys-secret-key-2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 72

# OpenAI Config
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
fastapi_app = FastAPI(title="Kinship Journeys API")

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
            'currency': user.get('currency', 'ZAR')
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
        'currency': user.get('currency', 'ZAR')
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
    
    system_prompt = """You are Kinship AI, a friendly family travel assistant for the Kinship Journeys app. 
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
        from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
        
        success_url = f"{data.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{data.origin_url}/payment/cancel"
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{data.origin_url}/api/webhook/stripe")
        
        checkout_request = CheckoutSessionRequest(
            amount=float(price),
            currency=data.currency.lower(),
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': user['id'],
                'plan': data.plan,
                'original_currency': data.currency
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        await db.payment_transactions.insert_one({
            'id': str(uuid.uuid4()),
            'session_id': session.session_id,
            'user_id': user['id'],
            'amount': price,
            'currency': data.currency,
            'plan': data.plan,
            'status': 'pending',
            'created_at': datetime.now(timezone.utc).isoformat()
        })
        
        return {'url': session.url, 'session_id': session.session_id}
        
    except ImportError:
        raise HTTPException(status_code=500, detail="Payment integration not available")
    except Exception as e:
        logger.error(f"Checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, user: dict = Depends(get_current_user)):
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        status = await stripe_checkout.get_checkout_status(session_id)
        
        await db.payment_transactions.update_one(
            {'session_id': session_id},
            {'$set': {'status': status.payment_status, 'updated_at': datetime.now(timezone.utc).isoformat()}}
        )
        
        return {
            'status': status.status,
            'payment_status': status.payment_status,
            'amount': status.amount_total / 100,
            'currency': status.currency
        }
    except ImportError:
        raise HTTPException(status_code=500, detail="Payment integration not available")
    except Exception as e:
        logger.error(f"Payment status error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# ADMIN ROUTES
# =============================================================================

ADMIN_SECRET = os.environ.get('ADMIN_SECRET', 'kinship-admin-2024')

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
    
    admin = await db.users.find_one({'email': 'admin@kinship.app'})
    if admin:
        return {'message': 'Admin already exists'}
    
    admin_id = str(uuid.uuid4())
    admin_user = {
        'id': admin_id,
        'email': 'admin@kinship.app',
        'password': hash_password('KinshipAdmin2024!'),
        'name': 'Super Admin',
        'family_id': None,
        'role': 'superadmin',
        'is_superadmin': True,
        'country': 'ZA',
        'currency': 'ZAR',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_user)
    
    return {'message': 'Admin created', 'email': 'admin@kinship.app', 'password': 'KinshipAdmin2024!'}

# =============================================================================
# SOCKET.IO EVENTS
# =============================================================================

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
    return {"message": "Kinship Journeys API", "version": "2.0.0"}

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

# Wrap FastAPI with Socket.IO
socket_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path='/api/socket.io')
app = socket_app

@fastapi_app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
