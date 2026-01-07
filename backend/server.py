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
# MODELS
# =============================================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    family_id: Optional[str] = None
    role: str = "member"
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

class TripResponse(BaseModel):
    id: str
    family_id: str
    name: str
    destination: str
    start_date: str
    end_date: str
    description: str
    budget: float
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
    currency: str = "USD"
    paid_by: Optional[str] = ""

class CheckoutRequest(BaseModel):
    plan: str
    origin_url: str

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
            'role': 'member'
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
            'role': user.get('role', 'member')
        }
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        'id': user['id'],
        'email': user['email'],
        'name': user['name'],
        'family_id': user.get('family_id'),
        'role': user.get('role', 'member')
    }

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
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.families.insert_one(family)
    
    # Update user's family_id and role
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
        {'$push': {'members': user['id']}}
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
    
    # Get member details
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
        'itinerary': [],
        'packing_list': [],
        'created_by': user['id'],
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.trips.insert_one(trip)
    
    # Return trip without MongoDB _id field
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
            'budget': data.budget or 0
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
    
    # Broadcast update
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
# BUDGET ROUTES
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
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.budget_items.insert_one(item)
    return item

@api_router.get("/trips/{trip_id}/budget")
async def get_budget_items(trip_id: str, user: dict = Depends(get_current_user)):
    items = await db.budget_items.find({'trip_id': trip_id}, {'_id': 0}).to_list(500)
    return items

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
    
    # Broadcast to family room
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
            
            # Try to parse JSON from response
            import json
            try:
                # Handle if wrapped in markdown code blocks
                if '```json' in content:
                    content = content.split('```json')[1].split('```')[0]
                elif '```' in content:
                    content = content.split('```')[1].split('```')[0]
                
                itinerary_items = json.loads(content.strip())
                
                # Add IDs to items
                for item in itinerary_items:
                    item['id'] = str(uuid.uuid4())
                
                # Update trip with new itinerary
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
SUBSCRIPTION_PLANS = {
    'monthly': {'amount': 9.99, 'name': 'Monthly Premium'},
    'yearly': {'amount': 99.99, 'name': 'Yearly Premium'},
}

@api_router.post("/payments/checkout")
async def create_checkout(data: CheckoutRequest, user: dict = Depends(get_current_user)):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Payment system not configured")
    
    plan = SUBSCRIPTION_PLANS.get(data.plan)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
        
        success_url = f"{data.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{data.origin_url}/payment/cancel"
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{data.origin_url}/api/webhook/stripe")
        
        checkout_request = CheckoutSessionRequest(
            amount=plan['amount'],
            currency='usd',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': user['id'],
                'plan': data.plan,
                'plan_name': plan['name']
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        await db.payment_transactions.insert_one({
            'id': str(uuid.uuid4()),
            'session_id': session.session_id,
            'user_id': user['id'],
            'amount': plan['amount'],
            'currency': 'usd',
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
        
        # Update transaction in database
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
# ADMIN ROUTES (Protected by admin check)
# =============================================================================

ADMIN_SECRET = os.environ.get('ADMIN_SECRET', 'kinship-admin-2024')

async def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    # Check if superadmin or has admin_secret header
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
    
    # Check if admin exists
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
    return {"message": "Kinship Journeys API", "version": "1.0.0"}

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
