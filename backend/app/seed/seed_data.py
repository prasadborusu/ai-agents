import uuid
import random
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import (
    Organization, User, MachineType, MachineLocation, Machine,
    Incident, IncidentSymptom, DiagnosticAttempt, Repair, RepairPart,
    TechnicianObservation, MachineMetric, Part, KnowledgePattern,
    MemoryReference
)
from app.core.logging import logger

DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001"

async def seed_database(session: AsyncSession) -> None:
    # Check if already seeded
    org_res = await session.execute(select(Organization).where(Organization.id == DEFAULT_ORG_ID))
    existing_org = org_res.scalar_one_or_none()
    if existing_org:
        # Check incident count
        count_res = await session.execute(select(func.count(Incident.id)).where(Incident.organization_id == DEFAULT_ORG_ID))
        if (count_res.scalar() or 0) >= 100:
            logger.info("Database already seeded with 100+ incidents.")
            return

    logger.info("Starting enterprise seed data initialization...")

    # 1. Organization
    org = Organization(
        id=DEFAULT_ORG_ID,
        name="Apex Precision Industries",
        slug="apex-precision",
        plan="enterprise",
        hindsight_bank_id="org_byte4_default"
    )
    session.add(org)
    await session.flush()

    # 2. Users
    technicians = [
        {"name": "Prasad", "email": "prasad@apexprecision.com", "role": "Maintenance Manager"},
        {"name": "Marcus Vance", "email": "marcus.v@apexprecision.com", "role": "Senior Diagnostic Technician"},
        {"name": "Elena Rostova", "email": "elena.r@apexprecision.com", "role": "Vibration Specialist"},
        {"name": "Tariq Mansour", "email": "tariq.m@apexprecision.com", "role": "Hydraulics Engineer"},
        {"name": "Sarah Chen", "email": "sarah.c@apexprecision.com", "role": "Automation Specialist"}
    ]
    created_users = []
    for t in technicians:
        u = User(
            organization_id=org.id,
            email=t["email"],
            full_name=t["name"],
            role=t["role"]
        )
        session.add(u)
        created_users.append(u)
    await session.flush()

    # 3. Machine Types
    types_data = [
        {"name": "CNC Machine", "code": "CNC", "desc": "Computer Numerical Control multi-axis milling & turning"},
        {"name": "Hydraulic Press", "code": "PRESS", "desc": "Heavy metal stamping & forging hydraulic systems"},
        {"name": "Industrial Pump", "code": "PMP", "desc": "High-volume centrifugal and positive displacement fluid pumps"},
        {"name": "Conveyor", "code": "CONV", "desc": "Continuous heavy material handling conveyor belts & drives"},
        {"name": "Compressor", "code": "COMP", "desc": "Industrial rotary screw pneumatic air compressors"}
    ]
    for td in types_data:
        session.add(MachineType(
            organization_id=org.id,
            name=td["name"],
            code=td["code"],
            description=td["desc"]
        ))

    # 4. Locations
    locations_data = [
        {"name": "Production Line A", "building": "Building 1", "floor": "Ground Floor"},
        {"name": "Production Line B", "building": "Building 1", "floor": "Ground Floor"},
        {"name": "Heavy Stamping Bay", "building": "Building 2", "floor": "Ground Floor"},
        {"name": "Assembly Cell 3", "building": "Building 1", "floor": "Mezzanine"},
        {"name": "Utilities & Compressors Room", "building": "Building 3", "floor": "Basement"}
    ]
    for ld in locations_data:
        session.add(MachineLocation(
            organization_id=org.id,
            name=ld["name"],
            building=ld["building"],
            floor=ld["floor"]
        ))

    # 5. Spare Parts Catalog
    parts_data = [
        {"number": "SKF-6208-2Z", "name": "Deep Groove Ball Bearing 40x80x18mm", "cat": "Bearings", "cost": 48.50},
        {"number": "TIM-32210", "name": "Tapered Roller Bearing High Precision", "cat": "Bearings", "cost": 115.00},
        {"number": "PARKER-HP-20", "name": "Proportional Valve Hydraulic Filter 10 Micron", "cat": "Hydraulics", "cost": 92.00},
        {"number": "GATES-B98", "name": "V-Belt Hi-Power Heavy Duty", "cat": "Power Transmission", "cost": 34.00},
        {"number": "OPTIBELT-5VX800", "name": "Wedge Cogged Belt High Torque", "cat": "Power Transmission", "cost": 42.00},
        {"number": "EBARA-IMP-104", "name": "Stainless Steel Closed Impeller", "cat": "Pumps", "cost": 210.00},
        {"number": "FLOW-SEAL-45", "name": "Mechanical Shaft Seal Silicon Carbide", "cat": "Seals", "cost": 85.00},
        {"number": "RTD-PT100-3M", "name": "Class A Platinum Temperature Sensor Probe", "cat": "Sensors", "cost": 65.00},
        {"number": "VIB-ACC-100", "name": "Piezoelectric Accelerometer 100mV/g", "cat": "Sensors", "cost": 175.00}
    ]
    created_parts = []
    for pd in parts_data:
        p = Part(
            organization_id=org.id,
            part_number=pd["number"],
            name=pd["name"],
            category=pd["cat"],
            stock_quantity=random.randint(5, 40),
            unit_cost=pd["cost"]
        )
        session.add(p)
        created_parts.append(p)
    await session.flush()

    # 6. Exactly 24 Machines (to match the dashboard 24 machines metric)
    machines_spec = [
        # CNCs
        {"code": "CNC-101", "name": "Okuma 5-Axis Machining Center", "type": "CNC Machine", "loc": "Production Line A", "status": "Good", "risk": "Low", "inc": 4, "hours": 4200},
        {"code": "CNC-102", "name": "Haas VF-4 CNC Vertical Mill", "type": "CNC Machine", "loc": "Production Line A", "status": "Alert", "risk": "High", "inc": 6, "hours": 5100},
        {"code": "CNC-103", "name": "Mazak Integrex Multi-Tasking Mill", "type": "CNC Machine", "loc": "Production Line A", "status": "Good", "risk": "Low", "inc": 3, "hours": 3800},
        {"code": "CNC-104", "name": "DMG MORI High-Precision CNC Lathe", "type": "CNC Machine", "loc": "Production Line A", "status": "Alert", "risk": "High", "inc": 8, "hours": 6400},
        {"code": "CNC-105", "name": "Makino Horizontal Machining Center", "type": "CNC Machine", "loc": "Production Line B", "status": "Good", "risk": "Low", "inc": 5, "hours": 4900},
        {"code": "CNC-106", "name": "Doosan Puma 2600 CNC Lathe", "type": "CNC Machine", "loc": "Production Line B", "status": "Good", "risk": "Low", "inc": 4, "hours": 3300},
        {"code": "CNC-107", "name": "Brother Speedio Compact Mill", "type": "CNC Machine", "loc": "Production Line B", "status": "Warning", "risk": "Medium", "inc": 6, "hours": 5700},

        # Hydraulic Presses
        {"code": "Press-12", "name": "Schuler 500-Ton Hydraulic Stamping Press", "type": "Hydraulic Press", "loc": "Heavy Stamping Bay", "status": "Good", "risk": "Low", "inc": 7, "hours": 8200},
        {"code": "Press-08", "name": "AIDA Deep Draw Hydraulic Forging Press", "type": "Hydraulic Press", "loc": "Heavy Stamping Bay", "status": "Warning", "risk": "Medium", "inc": 5, "hours": 7100},
        {"code": "Press-04", "name": "Komatsu Precision Stamping System", "type": "Hydraulic Press", "loc": "Heavy Stamping Bay", "status": "Good", "risk": "Low", "inc": 3, "hours": 4600},
        {"code": "HYD-04", "name": "Beckwood Dual-Ram Composite Molding Press", "type": "Hydraulic Press", "loc": "Heavy Stamping Bay", "status": "Good", "risk": "Low", "inc": 4, "hours": 3900},

        # Industrial Pumps
        {"code": "PMP-201", "name": "Goulds Multi-Stage Coolant Pump", "type": "Industrial Pump", "loc": "Production Line A", "status": "Warning", "risk": "Medium", "inc": 5, "hours": 9400},
        {"code": "PMP-202", "name": "Grundfos High-Pressure Delivery Pump", "type": "Industrial Pump", "loc": "Production Line B", "status": "Good", "risk": "Low", "inc": 4, "hours": 6200},
        {"code": "PMP-203", "name": "Sulzer Heavy Slurry Process Pump", "type": "Industrial Pump", "loc": "Heavy Stamping Bay", "status": "Good", "risk": "Low", "inc": 3, "hours": 4100},
        {"code": "PMP-204", "name": "Flowserve Chemical Circulation Pump", "type": "Industrial Pump", "loc": "Utilities & Compressors Room", "status": "Warning", "risk": "Medium", "inc": 5, "hours": 8700},

        # Conveyors
        {"code": "CONV-01", "name": "Dorner Heavy Duty Cleated Infeed Conveyor", "type": "Conveyor", "loc": "Production Line A", "status": "Good", "risk": "Low", "inc": 4, "hours": 5500},
        {"code": "CONV-02", "name": "Interroll Modular Cross-Belt Transfer", "type": "Conveyor", "loc": "Production Line B", "status": "Good", "risk": "Low", "inc": 3, "hours": 4300},
        {"code": "CONV-03", "name": "FlexLink Overhead Automated Monorail Conveyor", "type": "Conveyor", "loc": "Assembly Cell 3", "status": "Good", "risk": "Low", "inc": 3, "hours": 6100},
        {"code": "CONV-04", "name": "Hytrol Pallet Accumulation Conveyor", "type": "Conveyor", "loc": "Assembly Cell 3", "status": "Good", "risk": "Low", "inc": 4, "hours": 5100},
        {"code": "CONV-05", "name": "QC Conveyors High-Speed Precision Line", "type": "Conveyor", "loc": "Assembly Cell 3", "status": "Good", "risk": "Low", "inc": 2, "hours": 2900},

        # Compressors
        {"code": "COMP-01", "name": "Atlas Copco GA-75 VSD+ Screw Compressor", "type": "Compressor", "loc": "Utilities & Compressors Room", "status": "Good", "risk": "Low", "inc": 4, "hours": 11200},
        {"code": "COMP-02", "name": "Ingersoll Rand Nirvana Variable Speed Air Unit", "type": "Compressor", "loc": "Utilities & Compressors Room", "status": "Alert", "risk": "High", "inc": 7, "hours": 12800},
        {"code": "COMP-03", "name": "Kaeser CSDX 165 Rotary Screw System", "type": "Compressor", "loc": "Utilities & Compressors Room", "status": "Good", "risk": "Low", "inc": 3, "hours": 7400},
        {"code": "COMP-04", "name": "Sullair S-Energy High-Efficiency Compressor", "type": "Compressor", "loc": "Utilities & Compressors Room", "status": "Good", "risk": "Low", "inc": 2, "hours": 4800}
    ]

    created_machines = []
    for ms in machines_spec:
        m = Machine(
            organization_id=org.id,
            machine_code=ms["code"],
            name=ms["name"],
            type_name=ms["type"],
            location_name=ms["loc"],
            status=ms["status"],
            risk_level=ms["risk"],
            operating_hours=float(ms["hours"]),
            total_incidents=ms["inc"],
            last_incident_date=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 14))
        )
        session.add(m)
        created_machines.append(m)
    await session.flush()

    # 7. Add Real Telemetry Metrics for machines
    metric_configs = [
        {"name": "vibration_rms", "unit": "mm/s", "val": 2.1, "status": "Normal"},
        {"name": "spindle_temperature", "unit": "°C", "val": 42.5, "status": "Normal"},
        {"name": "hydraulic_pressure", "unit": "bar", "val": 210.0, "status": "Normal"},
        {"name": "motor_current", "unit": "A", "val": 18.4, "status": "Normal"}
    ]
    for m in created_machines:
        for mc in metric_configs:
            mult = 2.4 if m.status == "Alert" else (1.4 if m.status == "Warning" else 1.0)
            status_val = "Critical" if m.status == "Alert" else ("Warning" if m.status == "Warning" else "Normal")
            session.add(MachineMetric(
                organization_id=org.id,
                machine_id=m.id,
                metric_name=mc["name"],
                metric_value=round(mc["val"] * mult, 2),
                unit=mc["unit"],
                status=status_val,
                recorded_at=datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 120))
            ))

    # 8. Curate 100+ Historical Incidents with real learning patterns:
    # Pattern 1: High Vibration on CNCs (Failed = Bearing Replacement, Success = Shaft Alignment)
    # Pattern 2: Overheating on Pumps (Failed = Thermocouple/Sensor swap, Success = Coolant pump impeller clean)
    # Pattern 3: Pressure drop on Presses (Failed = Cylinder seal overhaul, Success = Filter cartridge replacement)
    # Pattern 4: Belt misalignment on Conveyors (Failed = Blind belt swap, Success = Laser pulley co-planarity alignment)
    # Pattern 5: Temperature spikes & motor trips on Compressors (Failed = Thermostat swap, Success = Oil cooler descaling)

    pattern_scenarios = [
        {
            "problem": "High vibration",
            "types": ["CNC Machine"],
            "symptoms": ["spindle vibration", "unusual noise", "increased temperature", "harmonic resonance at 2400 RPM"],
            "failed_action": "Bearing replacement",
            "failed_notes": "Replaced SKF-6208 bearing. Vibration returned immediately upon reaching operational RPM.",
            "success_action": "Shaft alignment",
            "root_cause": "Shaft misalignment (0.18mm angular deviation)",
            "lesson": "For recurring high vibration on CNCs, verify optical shaft alignment before replacing bearings.",
            "part": "SKF-6208-2Z"
        },
        {
            "problem": "Overheating",
            "types": ["Industrial Pump"],
            "symptoms": ["casing temperature > 85°C", "intermittent thermal trip", "cavitation hiss", "drop in flow rate"],
            "failed_action": "Replacing temperature probes",
            "failed_notes": "Installed new RTD probe. Pump continued tripping on high temperature after 35 minutes.",
            "success_action": "Coolant pump intake flush & impeller clean",
            "root_cause": "Intake suction manifold sediment fouling causing cavitation",
            "lesson": "On industrial pump overheating, inspect coolant loop flow and clean impeller prior to replacing sensors.",
            "part": "EBARA-IMP-104"
        },
        {
            "problem": "Pressure drop",
            "types": ["Hydraulic Press"],
            "symptoms": ["system pressure drop below 140 bar", "cycle time sluggish", "proportional valve chatter"],
            "failed_action": "Cylinder piston seal teardown",
            "failed_notes": "Disassembled primary cylinder to replace seals. Seals were intact; pressure drop remained.",
            "success_action": "Filter cartridge replacement",
            "root_cause": "Return line 10-micron filter element fully saturated with particulate",
            "lesson": "For hydraulic pressure loss, replace the 10-micron filter cartridge before executing cylinder teardowns.",
            "part": "PARKER-HP-20"
        },
        {
            "problem": "Belt misalignment",
            "types": ["Conveyor"],
            "symptoms": ["belt tracking sideways", "rubber dust on drive drum", "edge fraying", "squealing on startup"],
            "failed_action": "Replacing drive belt directly",
            "failed_notes": "Fitted new V-belt. The new belt walked off the crown within 48 hours.",
            "success_action": "Laser pulley alignment & tension calibration",
            "root_cause": "Drive pulley angular co-planarity skew of 1.4 degrees",
            "lesson": "Conveyor belt tracking failure requires dual-pulley laser co-planarity calibration, not just belt renewal.",
            "part": "GATES-B98"
        },
        {
            "problem": "Motor overload",
            "types": ["Compressor"],
            "symptoms": ["high amperage draw 38A", "thermal overload breaker trip", "discharge temperature high"],
            "failed_action": "Motor contactor replacement",
            "failed_notes": "Swapped electrical contactor. Overload trip repeated under heavy load.",
            "success_action": "Oil separator descaling & scavenger line clear",
            "root_cause": "Blocked scavenger return orifice creating viscous drag in compression screws",
            "lesson": "Air compressor high amp draw is often caused by clogged oil return lines rather than electrical failure.",
            "part": "FLOW-SEAL-45"
        }
    ]

    total_target_incidents = 149  # 142 Resolved + 7 Open = 149
    inc_counter = 1001

    base_time = datetime.now(timezone.utc) - timedelta(days=180)

    for i in range(total_target_incidents):
        is_open = i >= 142  # last 7 are open
        mach = created_machines[i % len(created_machines)]
        
        # Choose pattern matching machine type if possible
        matched_scenarios = [s for s in pattern_scenarios if mach.type_name in s["types"]]
        scenario = matched_scenarios[0] if matched_scenarios else pattern_scenarios[i % len(pattern_scenarios)]

        inc_time = base_time + timedelta(hours=i * 28 + random.randint(1, 10))
        inc_number = f"INC-{inc_counter}"
        inc_counter += 1

        is_recurring = (i % 3 == 0) or (mach.machine_code == "CNC-104") or (mach.machine_code == "PMP-201")
        recur_count = random.randint(2, 5) if is_recurring else 1

        status = "Open" if is_open else "Resolved"
        resolved_time = None if is_open else inc_time + timedelta(hours=random.randint(2, 18))

        inc = Incident(
            organization_id=org.id,
            incident_number=inc_number,
            machine_id=mach.id,
            reported_by_id=created_users[0].id,
            assigned_to_id=created_users[random.randint(0, len(created_users)-1)].id,
            title=f"{scenario['problem']} on {mach.machine_code}",
            problem_category=scenario["problem"],
            severity="High" if (mach.status == "Alert" or i % 5 == 0) else "Medium",
            status=status,
            is_recurring=is_recurring,
            recurring_count=recur_count,
            description=f"Operator observed severe {scenario['problem'].lower()} during active production shift on {mach.name}.",
            observed_behavior=f"Audible deviation and abnormal telemetry: {scenario['symptoms'][0]}.",
            measurements={"vibration_mm_s": round(random.uniform(4.5, 9.8), 2), "temperature_c": random.randint(65, 92)},
            environmental_conditions="Ambient shop floor 24°C, 45% RH",
            initial_observations=f"First inspection confirmed {scenario['symptoms'][0]} and {scenario['symptoms'][1]}.",
            resolved_at=resolved_time,
            root_cause=None if is_open else scenario["root_cause"],
            resolution_summary=None if is_open else f"Successfully conducted {scenario['success_action']}. Operational parameters returned to nominal range.",
            successful_action=None if is_open else scenario["success_action"],
            lesson_learned=None if is_open else scenario["lesson"],
            downtime_hours=round(random.uniform(1.2, 5.5), 1),
            created_at=inc_time,
            updated_at=resolved_time or inc_time
        )
        session.add(inc)
        await session.flush()

        # Add Symptoms
        for sym in scenario["symptoms"][:3]:
            session.add(IncidentSymptom(
                organization_id=org.id,
                incident_id=inc.id,
                symptom=sym,
                created_at=inc_time
            ))

        # Add Diagnostic Attempts (Failures + Success)
        if not is_open:
            # 1. Failed attempt first to represent historical troubleshooting learning
            session.add(DiagnosticAttempt(
                organization_id=org.id,
                incident_id=inc.id,
                attempt_order=1,
                technician_name=created_users[1].full_name,
                hypothesis=f"Suspected immediate component failure: {scenario['failed_action']}",
                action_taken=scenario["failed_action"],
                outcome="FAILED",
                notes=scenario["failed_notes"],
                created_at=inc_time + timedelta(hours=1)
            ))

            # 2. Successful attempt
            session.add(DiagnosticAttempt(
                organization_id=org.id,
                incident_id=inc.id,
                attempt_order=2,
                technician_name=created_users[0].full_name,
                hypothesis=scenario["root_cause"],
                action_taken=scenario["success_action"],
                outcome="RESOLVED",
                notes=f"Applied {scenario['success_action']}. Root cause eliminated.",
                created_at=resolved_time
            ))

            # 3. Repair Record
            repair = Repair(
                organization_id=org.id,
                incident_id=inc.id,
                machine_id=mach.id,
                performed_by=created_users[0].full_name,
                action_summary=scenario["success_action"],
                outcome="RESOLVED",
                root_cause=scenario["root_cause"],
                duration_hours=inc.downtime_hours,
                completed_at=resolved_time,
                created_at=resolved_time
            )
            session.add(repair)
            await session.flush()

            # Repair part
            session.add(RepairPart(
                organization_id=org.id,
                repair_id=repair.id,
                part_name=scenario["part"],
                quantity_used=1,
                outcome_impact="Validated & calibrated",
                created_at=resolved_time
            ))

            # 4. Technician Observation
            session.add(TechnicianObservation(
                organization_id=org.id,
                incident_id=inc.id,
                technician_name=created_users[0].full_name,
                observation_text=f"Observed that {scenario['failed_action']} was a waste of 3 hours. {scenario['lesson']}",
                environment_factors="High ambient vibration from neighboring milling cell",
                created_at=resolved_time
            ))

            # 5. Connect to Hindsight Memory Reference (Section 21)
            hindsight_mem_id = f"mem_hs_{inc.incident_number.lower()}_{mach.machine_code.lower()}"
            session.add(MemoryReference(
                organization_id=org.id,
                incident_id=inc.id,
                machine_id=mach.id,
                hindsight_memory_id=hindsight_mem_id,
                memory_type="successful_resolution",
                content_summary=(
                    f"{mach.machine_code} {scenario['problem']}: {scenario['failed_action']} FAILED, "
                    f"{scenario['success_action']} RESOLVED. Root cause: {scenario['root_cause']}."
                ),
                created_at=resolved_time
            ))

    await session.commit()
    logger.info(f"Database seed completed: {len(created_machines)} machines, {total_target_incidents} incidents created.")
