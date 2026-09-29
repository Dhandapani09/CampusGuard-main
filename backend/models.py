from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Site(Base):
    __tablename__ = "sites"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True, nullable=False)
    location_details = Column(String, nullable=True)
    buildings = relationship("Building", back_populates="site")

class Building(Base):
    __tablename__ = "buildings"
    id = Column(String, primary_key=True, default=generate_uuid)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    site = relationship("Site", back_populates="buildings")

class Department(Base):
    __tablename__ = "departments"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True, nullable=False)
    hod_name = Column(String, nullable=False)
    hod_email = Column(String, nullable=False)

class AccessoryType(Base):
    __tablename__ = "accessory_types"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)

class Visitor(Base):
    __tablename__ = "visitors"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, index=True)
    visitor_type = Column(String)  # Customer, Vendor, Guest, TempEmployee
    purpose = Column(String)
    host = Column(String)
    organization = Column(String)
    
    site_id = Column(String, ForeignKey("sites.id"), nullable=True)
    building_id = Column(String, ForeignKey("buildings.id"), nullable=True)
    
    check_in_time = Column(DateTime, default=datetime.utcnow)
    check_out_time = Column(DateTime, nullable=True)
    status = Column(String, default="ACTIVE") # ACTIVE, CHECKED_OUT
    photo_url = Column(String, nullable=True)
    id_type = Column(String, nullable=True)
    id_number = Column(String, nullable=True)
    valid_to = Column(DateTime, nullable=True)
    checkout_remarks = Column(String, nullable=True)
    
    accessories = relationship("VisitorAccessory", back_populates="visitor")

class VisitorAccessory(Base):
    __tablename__ = "visitor_accessories"
    id = Column(String, primary_key=True, default=generate_uuid)
    visitor_id = Column(String, ForeignKey("visitors.id"))
    accessory_type_id = Column(String, ForeignKey("accessory_types.id"))
    details = Column(String, nullable=True) # Serial number, model, etc.
    
    visitor = relationship("Visitor", back_populates="accessories")
    accessory_type = relationship("AccessoryType")

class Branding(Base):
    __tablename__ = "branding"
    id = Column(String, primary_key=True, default="default")
    company_name = Column(String, default="CampusGuard Default")
    logo_url = Column(String, nullable=True)
    tagline = Column(String, nullable=True)
    logo_initial = Column(String, default="CG")
    contact_info = Column(String, nullable=True)

class NotificationConfig(Base):
    __tablename__ = "notification_config"
    id = Column(String, primary_key=True, default="default")
    email_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=False)
    alert_threshold_mins = Column(Integer, default=120)

class Blacklist(Base):
    __tablename__ = "blacklist"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True, nullable=False)
    phone = Column(String, index=True, nullable=False)
    reason = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    role = Column(String, nullable=False) # Admin, Guard, Host
    site_id = Column(String, ForeignKey("sites.id"), nullable=True)
    password = Column(String, nullable=False, default="password123")
    
    site = relationship("Site")

class VisitorType(Base):
    __tablename__ = "visitor_types"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, index=True, nullable=False)
    banner_color = Column(String, nullable=False) # red, blue, green, yellow
    description = Column(String, nullable=True)
    skip_photo_capture = Column(Boolean, default=False, nullable=False)
