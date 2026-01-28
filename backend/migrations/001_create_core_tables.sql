-- ============================================================
-- 4S Logistics SaaS - Core Database Schema
-- Multi-tenant customs broker management system
-- ============================================================

-- 1️⃣ TENANTS (SaaS companies – brokers)
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    plan VARCHAR(50) DEFAULT 'basic', -- basic, pro, enterprise
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2️⃣ USERS (broker staff)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'staff', -- admin, staff, viewer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- 3️⃣ CUSTOMERS (importers/exporters)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    gst_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4️⃣ JOBS (MAIN TABLE – heart of system)
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_no VARCHAR(50) NOT NULL,
    bl_no VARCHAR(100),
    shipping_line VARCHAR(100),
    vessel_name VARCHAR(100),
    voyage_no VARCHAR(50),
    pol VARCHAR(100), -- Port of Loading
    pod VARCHAR(100), -- Port of Discharge
    eta DATE,
    ata DATE, -- Actual Time of Arrival
    status VARCHAR(30) DEFAULT 'created', -- created, in_transit, arrived, cleared, delivered, closed
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, job_no)
);

-- 5️⃣ CONTAINERS (one job → many containers)
CREATE TABLE IF NOT EXISTS containers (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    container_no VARCHAR(20) NOT NULL,
    size VARCHAR(10), -- 20, 40, 45
    type VARCHAR(20) DEFAULT 'dry', -- dry, reefer
    seal_no VARCHAR(50),
    status VARCHAR(30) DEFAULT 'pending' -- pending, discharged, in_transit, delivered
);

-- 6️⃣ JOB_MILESTONES (MOST IMPORTANT TABLE - tracks all status changes)
CREATE TABLE IF NOT EXISTS job_milestones (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    stage VARCHAR(30) NOT NULL, -- vessel, port, customs, transport
    milestone_code VARCHAR(50) NOT NULL, -- VESSEL_DEPARTED, VESSEL_ARRIVED, DISCHARGED, DO_READY, BOE_FILED, OOC_GRANTED, GATE_OUT, DELIVERED
    milestone_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, delayed
    completed_at TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7️⃣ DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL, -- BL, Invoice, PackingList, BOE, EwayBill
    file_url TEXT NOT NULL,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8️⃣ ALERTS
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL, -- email, sms, whatsapp
    message TEXT NOT NULL,
    sent_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' -- pending, sent, failed
);

-- 9️⃣ TRANSPORT
CREATE TABLE IF NOT EXISTS transport (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    transporter_name VARCHAR(255),
    vehicle_no VARCHAR(50),
    driver_phone VARCHAR(50),
    gate_out_time TIMESTAMP,
    delivered_time TIMESTAMP
);

-- 🔐 AUDIT & LOGGING
-- 10️⃣ ACTIVITY_LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    entity VARCHAR(50) NOT NULL, -- job, customer, document, etc.
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL, -- created, updated, deleted, viewed
    details JSONB, -- Additional context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔗 OPTIONAL (PHASE 2 – automation)
-- 11️⃣ SHIPPING_LINE_TRACKING
CREATE TABLE IF NOT EXISTS shipping_line_tracking (
    id SERIAL PRIMARY KEY,
    container_no VARCHAR(20) NOT NULL,
    last_location VARCHAR(255),
    event VARCHAR(100),
    event_time TIMESTAMP,
    source VARCHAR(50), -- maersk_api, msc_api, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12️⃣ CUSTOMS_STATUS
CREATE TABLE IF NOT EXISTS customs_status (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    boe_no VARCHAR(50),
    status VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_containers_job ON containers(job_id);
CREATE INDEX IF NOT EXISTS idx_milestones_job ON job_milestones(job_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON job_milestones(status);
CREATE INDEX IF NOT EXISTS idx_documents_job ON documents(job_id);
CREATE INDEX IF NOT EXISTS idx_alerts_job ON alerts(job_id);
CREATE INDEX IF NOT EXISTS idx_transport_job ON transport(job_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant ON activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_shipping_tracking_container ON shipping_line_tracking(container_no);

-- ============================================================
-- SEED: Default milestone templates
-- ============================================================

CREATE TABLE IF NOT EXISTS milestone_templates (
    id SERIAL PRIMARY KEY,
    stage VARCHAR(30) NOT NULL,
    milestone_code VARCHAR(50) NOT NULL UNIQUE,
    milestone_name VARCHAR(100) NOT NULL,
    sequence_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO milestone_templates (stage, milestone_code, milestone_name, sequence_order) VALUES
    ('vessel', 'VESSEL_DEPARTED', 'Vessel Departed from Origin', 1),
    ('vessel', 'VESSEL_ARRIVED', 'Vessel Arrived at Port', 2),
    ('port', 'DISCHARGED', 'Container Discharged', 3),
    ('port', 'DO_READY', 'Delivery Order Ready', 4),
    ('customs', 'BOE_FILED', 'Bill of Entry Filed', 5),
    ('customs', 'ASSESSMENT_DONE', 'Assessment Completed', 6),
    ('customs', 'DUTY_PAID', 'Duty Paid', 7),
    ('customs', 'OOC_GRANTED', 'Out of Charge Granted', 8),
    ('transport', 'GATE_OUT', 'Gate Out from Port', 9),
    ('transport', 'IN_TRANSIT', 'In Transit to Destination', 10),
    ('transport', 'DELIVERED', 'Delivered to Customer', 11)
ON CONFLICT (milestone_code) DO NOTHING;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
SELECT 'All 12+ tables created successfully!' as result;
