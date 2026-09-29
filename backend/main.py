from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
import models
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CampusGuard API", version="1.0.0")

# Allow CORS for React frontend (port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local development and Docker networking robustness
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC SCHEMAS -----------------

class BuildingCreate(BaseModel):
    name: str

class SiteCreate(BaseModel):
    name: str
    location_details: Optional[str] = None

class DepartmentCreate(BaseModel):
    name: str
    hod_name: str
    hod_email: str

class AccessoryTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None

class BlacklistCreate(BaseModel):
    name: str
    phone: str
    reason: Optional[str] = None

class BrandingUpdate(BaseModel):
    company_name: str
    logo_url: Optional[str] = None
    tagline: Optional[str] = None
    logo_initial: str
    contact_info: Optional[str] = None

class NotificationConfigUpdate(BaseModel):
    email_enabled: bool
    sms_enabled: bool
    alert_threshold_mins: int

class UserCreate(BaseModel):
    username: str
    name: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: str
    site_id: Optional[str] = None
    password: Optional[str] = "password123"

class LoginRequest(BaseModel):
    username: str
    password: str

class VisitorTypeCreate(BaseModel):
    name: str
    banner_color: str
    description: Optional[str] = None
    skip_photo_capture: bool = False

class VisitorAccessoryCreate(BaseModel):
    type: str  # Accessory Type Name
    details: Optional[str] = None

class VisitorCreate(BaseModel):
    id: Optional[str] = None
    type: str
    name: str
    phone: str
    comingFrom: Optional[str] = None
    purpose: str
    host: str
    site_id: Optional[str] = None
    building_id: Optional[str] = None
    photo: Optional[str] = None
    idType: Optional[str] = None
    idNumber: Optional[str] = None
    accessories: Optional[List[VisitorAccessoryCreate]] = []
    validUpto: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    expectedArrival: Optional[str] = None

class VisitorActivateRequest(BaseModel):
    idType: Optional[str] = None
    idNumber: Optional[str] = None
    photo: Optional[str] = None
    accessories: Optional[List[VisitorAccessoryCreate]] = []

# --- UPDATE SCHEMAS ---
class SiteUpdate(BaseModel):
    name: str
    location_details: Optional[str] = None

class BuildingUpdate(BaseModel):
    name: str

class DepartmentUpdate(BaseModel):
    name: str
    hod_name: str
    hod_email: str

class AccessoryTypeUpdate(BaseModel):
    name: str
    description: Optional[str] = None

class BlacklistUpdate(BaseModel):
    name: str
    phone: str
    reason: Optional[str] = None

class VisitorTypeUpdate(BaseModel):
    name: str
    banner_color: str
    description: Optional[str] = None
    skip_photo_capture: bool = False

class UserUpdate(BaseModel):
    username: str
    name: str
    email: str
    role: str
    password: Optional[str] = None

# ----------------- HELPER SERIALIZERS -----------------

def serialize_site(site: models.Site):
    return {
        "id": site.id,
        "name": site.name,
        "location": site.location_details or "",  # map location_details to location for frontend
        "location_details": site.location_details,
        "buildings": [{"id": b.id, "name": b.name, "site_id": b.site_id} for b in site.buildings]
    }

def serialize_user(user: models.User):
    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "site_id": user.site_id,
        "site_name": user.site.name if user.site else "All Sites"
    }

def serialize_visitor(visitor: models.Visitor):
    return {
        "id": visitor.id,
        "name": visitor.name,
        "phone": visitor.phone,
        "type": visitor.visitor_type,  # map visitor_type to type
        "visitor_type": visitor.visitor_type,
        "purpose": visitor.purpose,
        "host": visitor.host,
        "comingFrom": visitor.organization or "",  # map organization to comingFrom
        "organization": visitor.organization,
        "checkInTime": visitor.check_in_time.isoformat() if visitor.check_in_time else None,
        "check_in_time": visitor.check_in_time,
        "check_out_time": visitor.check_out_time,
        "status": visitor.status,
        "photo": visitor.photo_url or "",  # map photo_url to photo
        "photo_url": visitor.photo_url,
        "site_id": visitor.site_id,
        "building_id": visitor.building_id,
        "idType": visitor.id_type or "",
        "idNumber": visitor.id_number or "",
        "validUpto": visitor.valid_to.isoformat() if visitor.valid_to else None,
        "checkoutRemarks": visitor.checkout_remarks or "",
        "accessories": [
            {
                "id": acc.id,
                "type": acc.accessory_type.name if acc.accessory_type else "Unknown",
                "details": acc.details
            } for acc in visitor.accessories
        ]
    }

# Role-Based Access Control (RBAC) Verification Dependency
def require_role(allowed_roles: List[str]):
    def dependency(
        x_user_role: Optional[str] = Header(None),
        x_user_id: Optional[str] = Header(None),
        db: Session = Depends(get_db)
    ):
        ensure_seeded_users(db)
        # If no role header is sent, fallback to Guard for general api testing compatibility
        if not x_user_role:
            role = "Guard"
            user_id = "default"
            user_name = "Campus Guard"
        else:
            role = x_user_role
            user_id = x_user_id or ""
            db_user = None
            if user_id:
                # Find user to get their actual profile name
                db_user = db.query(models.User).filter(models.User.id == user_id).first()
                if not db_user:
                    db_user = db.query(models.User).filter(models.User.username == user_id).first()
            user_name = db_user.name if db_user else "Unknown User"
            
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Role '{role}' does not have permission for this resource."
            )
        return {"role": role, "id": user_id, "name": user_name}
    return dependency

# ----------------- API ENDPOINTS -----------------

@app.get("/")
def read_root():
    return {"status": "CampusGuard API is running on port 8080"}

# --- SITES & BUILDINGS ---

@app.get("/api/master/sites")
def get_sites(db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard", "Host"]))):
    sites = db.query(models.Site).all()
    return [serialize_site(s) for s in sites]

@app.post("/api/master/sites")
def create_site(site_in: SiteCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    # Check if site name already exists (case-insensitive)
    existing = db.query(models.Site).filter(models.Site.name.ilike(site_in.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Site with this name already exists")
    db_site = models.Site(name=site_in.name, location_details=site_in.location_details)
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    return serialize_site(db_site)

@app.put("/api/master/sites/{site_id}")
def update_site(site_id: str, site_in: SiteUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_site = db.query(models.Site).filter(models.Site.id == site_id).first()
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    # Check duplicate name excluding itself
    existing = db.query(models.Site).filter(models.Site.name.ilike(site_in.name), models.Site.id != site_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Another site with this name already exists")
    db_site.name = site_in.name
    db_site.location_details = site_in.location_details
    db.commit()
    db.refresh(db_site)
    return serialize_site(db_site)

@app.delete("/api/master/sites/{site_id}")
def delete_site(site_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_site = db.query(models.Site).filter(models.Site.id == site_id).first()
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    # Delete buildings under the site first
    db.query(models.Building).filter(models.Building.site_id == site_id).delete()
    
    db.delete(db_site)
    db.commit()
    return {"status": "success", "message": f"Site {site_id} deleted"}

@app.post("/api/master/sites/{site_id}/buildings")
def create_building(site_id: str, building_in: BuildingCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_site = db.query(models.Site).filter(models.Site.id == site_id).first()
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    # Check duplicate building in this site (case-insensitive)
    existing = db.query(models.Building).filter(
        models.Building.site_id == site_id,
        models.Building.name.ilike(building_in.name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Building with this name already exists on this site")
    
    db_building = models.Building(name=building_in.name, site_id=site_id)
    db.add(db_building)
    db.commit()
    db.refresh(db_building)
    return {"id": db_building.id, "name": db_building.name, "site_id": db_building.site_id}

@app.put("/api/master/sites/{site_id}/buildings/{building_id}")
def update_building(site_id: str, building_id: str, building_in: BuildingUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_building = db.query(models.Building).filter(
        models.Building.id == building_id, 
        models.Building.site_id == site_id
    ).first()
    if not db_building:
        raise HTTPException(status_code=404, detail="Building not found on this site")
    # Check duplicate building name in same site excluding itself
    existing = db.query(models.Building).filter(
        models.Building.site_id == site_id,
        models.Building.name.ilike(building_in.name),
        models.Building.id != building_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Another building with this name already exists on this site")
    
    db_building.name = building_in.name
    db.commit()
    db.refresh(db_building)
    return {"id": db_building.id, "name": db_building.name, "site_id": db_building.site_id}

@app.delete("/api/master/buildings/{building_id}")
def delete_building(building_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_building = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not db_building:
        raise HTTPException(status_code=404, detail="Building not found")
    
    db.delete(db_building)
    db.commit()
    return {"status": "success", "message": f"Building {building_id} deleted"}

# --- DEPARTMENTS ---

@app.get("/api/master/departments")
def get_departments(db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard", "Host"]))):
    depts = db.query(models.Department).all()
    return [{
        "id": d.id,
        "name": d.name,
        "hodName": d.hod_name,
        "hodEmail": d.hod_email
    } for d in depts]

@app.post("/api/master/departments")
def create_department(dept_in: DepartmentCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    existing = db.query(models.Department).filter(models.Department.name.ilike(dept_in.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")
    db_dept = models.Department(
        name=dept_in.name,
        hod_name=dept_in.hod_name,
        hod_email=dept_in.hod_email
    )
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return {
        "id": db_dept.id,
        "name": db_dept.name,
        "hodName": db_dept.hod_name,
        "hodEmail": db_dept.hod_email
    }

@app.put("/api/master/departments/{dept_id}")
def update_department(dept_id: str, dept_in: DepartmentUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    existing = db.query(models.Department).filter(models.Department.name.ilike(dept_in.name), models.Department.id != dept_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Another department with this name already exists")
    db_dept.name = dept_in.name
    db_dept.hod_name = dept_in.hod_name
    db_dept.hod_email = dept_in.hod_email
    db.commit()
    db.refresh(db_dept)
    return {
        "id": db_dept.id,
        "name": db_dept.name,
        "hodName": db_dept.hod_name,
        "hodEmail": db_dept.hod_email
    }

@app.delete("/api/master/departments/{dept_id}")
def delete_department(dept_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(db_dept)
    db.commit()
    return {"status": "success", "message": f"Department {dept_id} deleted"}

# --- ACCESSORY TYPES ---

@app.get("/api/master/accessories")
def get_accessory_types(db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard", "Host"]))):
    accessories = db.query(models.AccessoryType).all()
    return [{
        "id": a.id,
        "name": a.name,
        "desc": a.description or ""
    } for a in accessories]

@app.post("/api/master/accessories")
def create_accessory_type(acc_in: AccessoryTypeCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    existing = db.query(models.AccessoryType).filter(models.AccessoryType.name.ilike(acc_in.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Accessory Type already exists")
    db_acc = models.AccessoryType(name=acc_in.name, description=acc_in.description)
    db.add(db_acc)
    db.commit()
    db.refresh(db_acc)
    return {
        "id": db_acc.id,
        "name": db_acc.name,
        "desc": db_acc.description or ""
    }

@app.put("/api/master/accessories/{acc_id}")
def update_accessory_type(acc_id: str, acc_in: AccessoryTypeUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_acc = db.query(models.AccessoryType).filter(models.AccessoryType.id == acc_id).first()
    if not db_acc:
        raise HTTPException(status_code=404, detail="Accessory Type not found")
    existing = db.query(models.AccessoryType).filter(models.AccessoryType.name.ilike(acc_in.name), models.AccessoryType.id != acc_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Accessory Type with this name already exists")
    db_acc.name = acc_in.name
    db_acc.description = acc_in.description
    db.commit()
    db.refresh(db_acc)
    return {
        "id": db_acc.id,
        "name": db_acc.name,
        "desc": db_acc.description or ""
    }

@app.delete("/api/master/accessories/{acc_id}")
def delete_accessory_type(acc_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_acc = db.query(models.AccessoryType).filter(models.AccessoryType.id == acc_id).first()
    if not db_acc:
        raise HTTPException(status_code=404, detail="Accessory Type not found")
    db.delete(db_acc)
    db.commit()
    return {"status": "success", "message": f"Accessory Type {acc_id} deleted"}

# --- SECURITY BLACKLIST ---

@app.get("/api/security/blacklist")
def get_blacklist(db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard"]))):
    entries = db.query(models.Blacklist).all()
    return [{
        "id": b.id,
        "name": b.name,
        "phone": b.phone,
        "reason": b.reason or ""
    } for b in entries]

@app.post("/api/security/blacklist")
def add_to_blacklist(black_in: BlacklistCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    # Avoid duplicate exact blacklist matches
    existing = db.query(models.Blacklist).filter(
        models.Blacklist.name == black_in.name,
        models.Blacklist.phone == black_in.phone
    ).first()
    if existing:
        return {
            "id": existing.id,
            "name": existing.name,
            "phone": existing.phone,
            "reason": existing.reason or ""
        }
    
    db_black = models.Blacklist(
        name=black_in.name,
        phone=black_in.phone,
        reason=black_in.reason
    )
    db.add(db_black)
    db.commit()
    db.refresh(db_black)
    return {
        "id": db_black.id,
        "name": db_black.name,
        "phone": db_black.phone,
        "reason": db_black.reason or ""
    }

@app.put("/api/security/blacklist/{blacklist_id}")
def update_blacklist(blacklist_id: str, black_in: BlacklistUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_black = db.query(models.Blacklist).filter(models.Blacklist.id == blacklist_id).first()
    if not db_black:
        raise HTTPException(status_code=404, detail="Blacklist entry not found")
    db_black.name = black_in.name
    db_black.phone = black_in.phone
    db_black.reason = black_in.reason
    db.commit()
    db.refresh(db_black)
    return {
        "id": db_black.id,
        "name": db_black.name,
        "phone": db_black.phone,
        "reason": db_black.reason or ""
    }

@app.delete("/api/security/blacklist/{blacklist_id}")
def delete_from_blacklist(blacklist_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_black = db.query(models.Blacklist).filter(models.Blacklist.id == blacklist_id).first()
    if not db_black:
        raise HTTPException(status_code=404, detail="Blacklist entry not found")
    db.delete(db_black)
    db.commit()
    return {"status": "success", "message": "Blacklist entry removed"}

# --- BRANDING ---

@app.get("/api/settings/branding")
def get_branding(db: Session = Depends(get_db)):
    branding = db.query(models.Branding).first()
    if not branding:
        branding = models.Branding(
            id="default",
            company_name="CampusGuard",
            logo_url="",
            tagline="Secure. Smart. Seamless.",
            logo_initial="CG",
            contact_info="security@campusguard.local"
        )
        db.add(branding)
        db.commit()
        db.refresh(branding)
    return branding

@app.post("/api/settings/branding")
def update_branding(branding_in: BrandingUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    branding = db.query(models.Branding).first()
    if not branding:
        branding = models.Branding(id="default")
        db.add(branding)
    
    branding.company_name = branding_in.company_name
    branding.logo_url = branding_in.logo_url
    branding.tagline = branding_in.tagline
    branding.logo_initial = branding_in.logo_initial
    branding.contact_info = branding_in.contact_info
    
    db.commit()
    db.refresh(branding)
    return branding

# --- NOTIFICATION CONFIG ---

@app.get("/api/settings/notifications")
def get_notifications(db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    notif = db.query(models.NotificationConfig).first()
    if not notif:
        notif = models.NotificationConfig(
            id="default",
            email_enabled=True,
            sms_enabled=False,
            alert_threshold_mins=120
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
    return notif

@app.post("/api/settings/notifications")
def update_notifications(notif_in: NotificationConfigUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    notif = db.query(models.NotificationConfig).first()
    if not notif:
        notif = models.NotificationConfig(id="default")
        db.add(notif)
    
    notif.email_enabled = notif_in.email_enabled
    notif.sms_enabled = notif_in.sms_enabled
    notif.alert_threshold_mins = notif_in.alert_threshold_mins
    
    db.commit()
    db.refresh(notif)
    return notif

# --- VISITORS ---

@app.get("/api/visitors/active")
def get_active_visitors(db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard"]))):
    visitors = db.query(models.Visitor).filter(models.Visitor.status == "ACTIVE").order_by(models.Visitor.check_in_time.desc()).all()
    return {"visitors": [serialize_visitor(v) for v in visitors]}

@app.post("/api/visitors")
def create_visitor(visitor_in: VisitorCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard", "Host"]))):
    # Check if Host role attempts to create non-REQUESTED or spoof host name
    if current_user["role"] == "Host":
        if visitor_in.status != "REQUESTED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Host role is only permitted to create pre-registration invites (status must be 'REQUESTED')."
            )
        if visitor_in.host != current_user["name"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Host name must match your profile name '{current_user['name']}'."
            )
    # Check if this is an activation of a pre-registered requested visitor
    existing_requested = None
    if visitor_in.id:
        existing_requested = db.query(models.Visitor).filter(
            models.Visitor.id == visitor_in.id,
            models.Visitor.status == "REQUESTED"
        ).first()

    # Check if visitor is already IN (Active pass exists) based on phone or ID Number
    if visitor_in.status != "REQUESTED" and not existing_requested:
        duplicate_query = db.query(models.Visitor).filter(models.Visitor.status == "ACTIVE")
        
        active_existing = None
        if visitor_in.idNumber:
            active_existing = duplicate_query.filter(
                (models.Visitor.phone == visitor_in.phone) | 
                (models.Visitor.id_number == visitor_in.idNumber)
            ).first()
        else:
            active_existing = duplicate_query.filter(
                models.Visitor.phone == visitor_in.phone
            ).first()
            
        if active_existing:
            raise HTTPException(
                status_code=400,
                detail=f"Visitor is already checked in (Active pass exists: {active_existing.id})"
            )

    # Save the visitor details
    valid_to_dt = None
    if visitor_in.validUpto:
        try:
            clean_val = visitor_in.validUpto.replace("Z", "")
            if "T" in clean_val:
                parts = clean_val.split(":")
                if len(parts) == 2:
                    valid_to_dt = datetime.strptime(clean_val, "%Y-%m-%dT%H:%M")
                elif len(parts) >= 3:
                    valid_to_dt = datetime.strptime(clean_val[:19], "%Y-%m-%dT%H:%M:%S")
            else:
                valid_to_dt = datetime.fromisoformat(clean_val)
        except Exception as e:
            # Fallback
            valid_to_dt = None

    expected_arrival_dt = None
    if visitor_in.expectedArrival:
        try:
            clean_val = visitor_in.expectedArrival.replace("Z", "")
            if "T" in clean_val:
                parts = clean_val.split(":")
                if len(parts) == 2:
                    expected_arrival_dt = datetime.strptime(clean_val, "%Y-%m-%dT%H:%M")
                elif len(parts) >= 3:
                    expected_arrival_dt = datetime.strptime(clean_val[:19], "%Y-%m-%dT%H:%M:%S")
            else:
                expected_arrival_dt = datetime.fromisoformat(clean_val)
        except Exception as e:
            expected_arrival_dt = None
            
    if existing_requested:
        # Perform UPDATE to activate requested visitor to ACTIVE check-in
        existing_requested.status = visitor_in.status or "ACTIVE"
        if existing_requested.status == "ACTIVE":
            existing_requested.check_in_time = datetime.utcnow()
        else:
            existing_requested.check_in_time = expected_arrival_dt
            
        existing_requested.visitor_type = visitor_in.type
        existing_requested.name = visitor_in.name
        existing_requested.phone = visitor_in.phone
        existing_requested.purpose = visitor_in.purpose
        existing_requested.host = visitor_in.host
        existing_requested.organization = visitor_in.comingFrom
        existing_requested.site_id = visitor_in.site_id
        existing_requested.building_id = visitor_in.building_id
        if visitor_in.photo:
            existing_requested.photo_url = visitor_in.photo
        existing_requested.id_type = visitor_in.idType
        existing_requested.id_number = visitor_in.idNumber
        existing_requested.valid_to = valid_to_dt
        
        # Link accessories
        db.query(models.VisitorAccessory).filter(models.VisitorAccessory.visitor_id == existing_requested.id).delete()
        for acc in visitor_in.accessories:
            acc_type = db.query(models.AccessoryType).filter(models.AccessoryType.name == acc.type).first()
            if not acc_type:
                acc_type = models.AccessoryType(name=acc.type, description="Auto-created during verification")
                db.add(acc_type)
                db.flush()
                
            db_acc = models.VisitorAccessory(
                visitor_id=existing_requested.id,
                accessory_type_id=acc_type.id,
                details=acc.details
            )
            db.add(db_acc)
            
        db.commit()
        db.refresh(existing_requested)
        return serialize_visitor(existing_requested)

    # Otherwise, perform standard insert
    visitor_id = visitor_in.id or f"VIS-{uuid.uuid4().hex[:6].upper()}"
    
    db_visitor = models.Visitor(
        id=visitor_id,
        name=visitor_in.name,
        phone=visitor_in.phone,
        visitor_type=visitor_in.type,
        purpose=visitor_in.purpose,
        host=visitor_in.host,
        organization=visitor_in.comingFrom,
        site_id=visitor_in.site_id,
        building_id=visitor_in.building_id,
        check_in_time=expected_arrival_dt if (visitor_in.status == "REQUESTED") else datetime.utcnow(),
        status=visitor_in.status or "ACTIVE",
        photo_url=visitor_in.photo,
        id_type=visitor_in.idType,
        id_number=visitor_in.idNumber,
        valid_to=valid_to_dt
    )
    db.add(db_visitor)
    db.flush()  # Populate db_visitor relationships
    
    # Link accessories
    for acc in visitor_in.accessories:
        # Find accessory type by name (or create it if it doesn't exist)
        acc_type = db.query(models.AccessoryType).filter(models.AccessoryType.name == acc.type).first()
        if not acc_type:
            acc_type = models.AccessoryType(name=acc.type, description="Auto-created during entry")
            db.add(acc_type)
            db.flush()
            
        db_acc = models.VisitorAccessory(
            visitor_id=db_visitor.id,
            accessory_type_id=acc_type.id,
            details=acc.details
        )
        db.add(db_acc)
        
    db.commit()
    db.refresh(db_visitor)
    return serialize_visitor(db_visitor)

@app.post("/api/visitors/{visitor_id}/checkout")
def checkout_visitor(visitor_id: str, checkout_type: str = "PERMANENT", remarks: Optional[str] = None, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard"]))):
    db_visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not db_visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    if checkout_type == "TEMP":
        db_visitor.status = "TEMP_OUT"
    else:
        db_visitor.status = "CHECKED_OUT"
        
    if remarks:
        db_visitor.checkout_remarks = remarks
        
    db_visitor.check_out_time = datetime.utcnow()
    db.commit()
    db.refresh(db_visitor)
    return serialize_visitor(db_visitor)

@app.post("/api/visitors/{visitor_id}/return")
def return_visitor(visitor_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard"]))):
    db_visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not db_visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    if db_visitor.status != "TEMP_OUT":
        raise HTTPException(status_code=400, detail="Visitor is not temporarily checked out")
        
    db_visitor.status = "ACTIVE"
    db_visitor.check_in_time = datetime.utcnow()
    db.commit()
    db.refresh(db_visitor)
    return serialize_visitor(db_visitor)

@app.get("/api/visitors/temp-out")
def get_temp_out_visitors(db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard"]))):
    visitors = db.query(models.Visitor).filter(models.Visitor.status == "TEMP_OUT").order_by(models.Visitor.check_out_time.desc()).all()
    return {"visitors": [serialize_visitor(v) for v in visitors]}

@app.get("/api/visitors/history")
def get_visitor_history(from_date: Optional[str] = None, to_date: Optional[str] = None, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard", "Host"]))):
    query = db.query(models.Visitor)
    
    if current_user["role"] == "Host":
        query = query.filter(models.Visitor.host == current_user["name"])
        
    if from_date:
        try:
            clean_val = from_date.replace("Z", "")
            if "T" in clean_val:
                parts = clean_val.split(":")
                if len(parts) == 2:
                    dt_from = datetime.strptime(clean_val, "%Y-%m-%dT%H:%M")
                elif len(parts) >= 3:
                    dt_from = datetime.strptime(clean_val[:19], "%Y-%m-%dT%H:%M:%S")
            else:
                dt_from = datetime.fromisoformat(clean_val)
            query = query.filter(models.Visitor.check_in_time >= dt_from)
        except Exception as e:
            print("Error parsing from_date in history API:", e)
            
    if to_date:
        try:
            clean_val = to_date.replace("Z", "")
            if "T" in clean_val:
                parts = clean_val.split(":")
                if len(parts) == 2:
                    dt_to = datetime.strptime(clean_val, "%Y-%m-%dT%H:%M")
                elif len(parts) >= 3:
                    dt_to = datetime.strptime(clean_val[:19], "%Y-%m-%dT%H:%M:%S")
            else:
                dt_to = datetime.fromisoformat(clean_val)
            query = query.filter(models.Visitor.check_in_time <= dt_to)
        except Exception as e:
            print("Error parsing to_date in history API:", e)
            
    visitors = query.order_by(models.Visitor.check_in_time.desc()).all()
    return {"visitors": [serialize_visitor(v) for v in visitors]}

# --- USERS & ROLE MANAGEMENT ---

def ensure_seeded_users(db: Session):
    # Migrate old role names to the new aligned ones
    db.query(models.User).filter(models.User.role == "Security").update({"role": "Guard"}, synchronize_session=False)
    db.query(models.User).filter(models.User.role == "Staff").update({"role": "Host"}, synchronize_session=False)
    db.commit()

    users_count = db.query(models.User).count()
    if users_count == 0:
        default_admin = models.User(
            username="admin",
            name="System Administrator",
            email="admin@campusguard.local",
            role="Admin",
            password="admin123"
        )
        default_guard = models.User(
            username="guard",
            name="Campus Guard",
            email="guard@campusguard.local",
            role="Guard",
            password="password123"
        )
        db.add(default_admin)
        db.add(default_guard)
        db.commit()


@app.post("/api/auth/login")
def login_operator(credentials: LoginRequest, db: Session = Depends(get_db)):
    ensure_seeded_users(db)
    user = db.query(models.User).filter(models.User.username == credentials.username).first()
    if not user or user.password != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    return {
        "status": "success",
        "user": serialize_user(user)
    }

@app.get("/api/users")
def get_users(db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    ensure_seeded_users(db)
    users = db.query(models.User).all()
    return [serialize_user(u) for u in users]

@app.post("/api/users")
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    existing = db.query(models.User).filter(models.User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    resolved_name = user_in.name or user_in.full_name or user_in.username
    resolved_email = user_in.email or f"{user_in.username}@campusguard.local"
    
    db_user = models.User(
        username=user_in.username,
        name=resolved_name,
        email=resolved_email,
        role=user_in.role,
        site_id=user_in.site_id,
        password=user_in.password or "password123"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return serialize_user(db_user)

@app.delete("/api/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if db_user.role == "Admin":
        admin_count = db.query(models.User).filter(models.User.role == "Admin").count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last remaining Admin user")
            
    db.delete(db_user)
    db.commit()
    return {"status": "success", "message": f"User {user_id} deleted"}

@app.put("/api/users/{user_id}")
def update_user(user_id: str, user_in: UserUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    existing = db.query(models.User).filter(models.User.username == user_in.username, models.User.id != user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    db_user.username = user_in.username
    db_user.name = user_in.name
    db_user.email = user_in.email
    db_user.role = user_in.role
    if user_in.password:
        db_user.password = user_in.password
    db.commit()
    db.refresh(db_user)
    return serialize_user(db_user)

# --- VISITOR TYPES MASTER ---

@app.get("/api/master/visitor-types")
def get_visitor_types(db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard", "Host"]))):
    types = db.query(models.VisitorType).all()
    # Auto-seed defaults if table is empty
    if not types:
        defaults = [
            models.VisitorType(name="Customer", banner_color="red", description="VIP Guest Pathway (Skip photo option)", skip_photo_capture=True),
            models.VisitorType(name="Vendor", banner_color="blue", description="Vendor or Contractor (Asset tracking required)", skip_photo_capture=False),
            models.VisitorType(name="Guest", banner_color="green", description="Standard General Visitor Entry", skip_photo_capture=False),
            models.VisitorType(name="TempEmployee", banner_color="yellow", description="Temporary / Forgotten ID badge flow", skip_photo_capture=False)
        ]
        for item in defaults:
            db.add(item)
        db.commit()
        types = db.query(models.VisitorType).all()
        
    return [{
        "id": t.id,
        "name": t.name,
        "banner_color": t.banner_color,
        "description": t.description or "",
        "skip_photo_capture": t.skip_photo_capture
    } for t in types]

@app.post("/api/master/visitor-types")
def create_visitor_type(type_in: VisitorTypeCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    existing_name = db.query(models.VisitorType).filter(models.VisitorType.name.ilike(type_in.name)).first()
    if existing_name:
        raise HTTPException(status_code=400, detail="Visitor Type with this name already exists")
    
    existing_color = db.query(models.VisitorType).filter(models.VisitorType.banner_color.ilike(type_in.banner_color)).first()
    if existing_color:
        raise HTTPException(status_code=400, detail="A visitor type with this color already exists")
    
    db_type = models.VisitorType(
        name=type_in.name,
        banner_color=type_in.banner_color,
        description=type_in.description,
        skip_photo_capture=type_in.skip_photo_capture
    )
    db.add(db_type)
    db.commit()
    db.refresh(db_type)
    return {
        "id": db_type.id,
        "name": db_type.name,
        "banner_color": db_type.banner_color,
        "description": db_type.description or "",
        "skip_photo_capture": db_type.skip_photo_capture
    }

@app.put("/api/master/visitor-types/{type_id}")
def update_visitor_type(type_id: str, type_in: VisitorTypeUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_type = db.query(models.VisitorType).filter(models.VisitorType.id == type_id).first()
    if not db_type:
        raise HTTPException(status_code=404, detail="Visitor Type not found")
    
    existing_name = db.query(models.VisitorType).filter(models.VisitorType.name.ilike(type_in.name), models.VisitorType.id != type_id).first()
    if existing_name:
        raise HTTPException(status_code=400, detail="Another visitor type with this name already exists")
        
    existing_color = db.query(models.VisitorType).filter(models.VisitorType.banner_color.ilike(type_in.banner_color), models.VisitorType.id != type_id).first()
    if existing_color:
        raise HTTPException(status_code=400, detail="Another visitor type with this color already exists")
        
    db_type.name = type_in.name
    db_type.banner_color = type_in.banner_color
    db_type.description = type_in.description
    db_type.skip_photo_capture = type_in.skip_photo_capture
    db.commit()
    db.refresh(db_type)
    return {
        "id": db_type.id,
        "name": db_type.name,
        "banner_color": db_type.banner_color,
        "description": db_type.description or "",
        "skip_photo_capture": db_type.skip_photo_capture
    }

@app.delete("/api/master/visitor-types/{type_id}")
def delete_visitor_type(type_id: str, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin"]))):
    db_type = db.query(models.VisitorType).filter(models.VisitorType.id == type_id).first()
    if not db_type:
        raise HTTPException(status_code=404, detail="Visitor Type not found")
        
    db.delete(db_type)
    db.commit()
    return {"status": "success", "message": f"Visitor Type {type_id} deleted"}

@app.post("/api/visitors/{visitor_id}/activate")
def activate_visitor(visitor_id: str, act_in: VisitorActivateRequest, db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard"]))):
    db_visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not db_visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    if db_visitor.status != "REQUESTED":
        raise HTTPException(status_code=400, detail="Visitor is not in requested state")
        
    db_visitor.status = "ACTIVE"
    db_visitor.check_in_time = datetime.utcnow()
    if act_in.idType:
        db_visitor.id_type = act_in.idType
    if act_in.idNumber:
        db_visitor.id_number = act_in.idNumber
    if act_in.photo:
        db_visitor.photo_url = act_in.photo
        
    # Link accessories
    for acc in act_in.accessories:
        acc_type = db.query(models.AccessoryType).filter(models.AccessoryType.name == acc.type).first()
        if not acc_type:
            acc_type = models.AccessoryType(name=acc.type, description="Auto-created during activation")
            db.add(acc_type)
            db.flush()
            
        db_acc = models.VisitorAccessory(
            visitor_id=db_visitor.id,
            accessory_type_id=acc_type.id,
            details=acc.details
        )
        db.add(db_acc)
        
    db.commit()
    db.refresh(db_visitor)
    return serialize_visitor(db_visitor)

@app.get("/api/visitors/requested")
def get_requested_visitors(db: Session = Depends(get_db), current_user: dict = Depends(require_role(["Admin", "Guard", "Host"]))):
    query = db.query(models.Visitor).filter(models.Visitor.status == "REQUESTED")
    if current_user["role"] == "Host":
        query = query.filter(models.Visitor.host == current_user["name"])
    visitors = query.order_by(models.Visitor.id.desc()).all()
    return {"visitors": [serialize_visitor(v) for v in visitors]}
