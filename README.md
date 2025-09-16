# FinBloom – 3-Tier Finance Tracker Web Application  

A **cloud-deployed 3-tier finance tracker application** that calculates expenditures based on transactions added.  
This project demonstrates how to **securely and cost-effectively deploy a web application to AWS** using best practices in **networking, security, and availability**.

## Purpose of the Project  

The goal of this project was not just to build a finance app but to:  

- Gain **hands-on experience** with deploying a 3-tier application on AWS.  
- Practice **secure network design** with public/private subnets.  
- Learn **load balancing, HTTPS setup, and DNS management**.  
- Understand **cost-effective cloud deployment strategies** for businesses.
  
<img width="956" height="838" alt="FinBloom Cloud Architecture" src="https://github.com/user-attachments/assets/c19a4514-9475-4c45-9705-9b7c48978a24" />

## Architecture Overview  
The project follows a **3-tier architecture**:  

1. **Frontend**  
   - Built with **HTML, CSS, and JavaScript**.  
   - Hosted in the **public subnet** for internet accessibility.  

2. **Backend**  
   - Built with **Node.js (Express)**.  
   - Runs in the **public subnet**, communicates with both frontend and database.  

3. **Database**  
   - **PostgreSQL** hosted in a **private subnet**.  
   - Accessible only by the backend via a **bastion host** for secure administration.  

## Networking & Security  

- **VPC Setup**:  
  - Public Subnets → Frontend + Backend.  
  - Private Subnet → PostgreSQL database.  
  - Internet Gateway → Allows internet access for public subnets.  
  - Bastion Host → Provides secure SSH access to the private database. 

- **Security Groups**:  
  - Application Load Balancer  Accepts HTTP (80) and HTTPS (443) from the internet.  
  - Backend accepts traffic from the ALB on port `5000`.  
  - Database accepts traffic only from the backend.  

- **Load Balancing**:  
  - **Application Load Balancer ** distributes traffic across **two Availability Zones**, ensuring high availability and reduced latency.  
  - **Listener Rules**:  
    - `/` → Forwards to **Frontend Target Group (port 80)**.  
    - `/api/*` → Forwards to **Backend Target Group (port 5000)**.  

- **Encryption**:  
  - Provisioned an **SSL/TLS certificate** with **AWS Certificate Manager (ACM)**.  
  - Application accessible via **HTTPS** (`https://www.finbloom.work.gd`).  


## Domain & DNS  
- Domain registered via **Freedomain.one** (`www.finbloom.work.gd`).
<img width="1349" height="340" alt="Screenshot 2025-09-14 210216" src="https://github.com/user-attachments/assets/141dfbf1-9323-4117-b272-4127ee690b22" />
- CNAME record points to the **AWS Application Load Balancer DNS name**.  
- (Alternative: Route 53 could be used for advanced DNS and security features).  

## Deployment Steps  

### 1️ VPC & Networking  
- Create a VPC with **public and private subnets** across 2 Availability Zones.  
- Attach an **Internet Gateway** to allow internet access.  
- Set up a **Bastion Host** for private subnet access.
<img width="1348" height="469" alt="Screenshot 2025-09-13 185049" src="https://github.com/user-attachments/assets/b993dc9d-ff66-4640-b8d9-72d433cca7ff" />


### 2️ Database Layer (RDS in a Private Subnet)  
- Launch **PostgreSQL** instance in the **private subnet**.  
- Configure Security Group: allow inbound traffic only from the backend SG.  
- Connect via **bastion host** for administration.  

### 3️ Backend Layer (Public Subnet)  
- Launch an EC2 instance for the **Node.js backend**.
 <img width="1353" height="331" alt="Screenshot 2025-09-14 181459" src="https://github.com/user-attachments/assets/2fb58ec1-8503-4bfb-8e1c-b1c89b00df9e" />
- Deploy the backend application (port `5000`).  
- Configure Security Group: allow inbound traffic from Apllications load balnacer Security and RDS security group.  

### 4️ Frontend Layer (Public Subnet)  
- Launch an EC2 instance for the **HTML/CSS/JS frontend**.  
- Configure NGINX/Apache (or serve static files directly).
   <img width="1366" height="569" alt="Screenshot 2025-09-14 181703" src="https://github.com/user-attachments/assets/89a656a4-14ba-4830-800f-97ea740d556e" />
- Security Group: allow inbound traffic from the internet.  

### 5️ Load Balancer & Target Groups  
- Create an **Application Load Balancer**.  
- Create **Frontend Target Group (HTTP:80)** and **Backend Target Group (HTTP:5000)**.
  <img width="1364" height="334" alt="Screenshot 2025-09-14 185359" src="https://github.com/user-attachments/assets/a5481238-6892-4a41-84d7-c13f005cac7f" />
- Register respective EC2 instances.  
- Configure **Listeners & Rules**:  
  - HTTPS (443) → Forward `/` to Frontend TG.  
  - HTTPS (443) → Forward `/api/*` to Backend TG.  

### 6️ Domain & SSL  
- Request SSL certificate in **ACM** for your domain.
  <img width="1358" height="383" alt="Screenshot 2025-09-14 210012" src="https://github.com/user-attachments/assets/8dee3119-e3ee-425a-a133-fd3069b1add0" />
- Attach the cert to the ALB HTTPS listener.  
- Create a **CNAME record** in Freenom pointing to ALB DNS name.
<img width="677" height="280" alt="Screenshot 2025-09-12 212226" src="https://github.com/user-attachments/assets/11a425d2-a442-4a69-b2e9-fdd8573f2f4a" />

### 7️ Verification  
- Access app via:  
  - Frontend → `https://www.finbloom.work.gd`  
  - Backend APIs → `https://www.finbloom.work.gd/api/...`  

## Application running on `https://www.finbloom.work.gd` 

<img width="1352" height="683" alt="Screenshot 2025-09-13 184727" src="https://github.com/user-attachments/assets/aab7a7b3-3aec-4d5e-8560-cd886e9875cc" />


##  AWS Services & Business Impact  
This project uses multiple AWS services, each with a specific **purpose** and **business impact**:  

- **VPC (Virtual Private Cloud):**  
  - Purpose: Provides a logically isolated network for the application.  
  - Impact: Ensures data and workloads are protected, meeting compliance and security standards for businesses.  

- **Subnets (Public & Private):**  
  - Purpose: Separate resources that require internet access (frontend/backend) from those that should remain private (database).  
  - Impact: Reduces the attack surface by limiting exposure of sensitive systems like databases.  

- **EC2 (Elastic Compute Cloud):**  
  - Purpose: Hosts the frontend, backend, and bastion host servers.  
  - Impact: Offers flexible, scalable compute resources for applications of any size.  

- **RDS PostgreSQL on Private EC2:**  
  - Purpose: Stores transaction data securely.  
  - Impact: Protects business-critical data by ensuring it’s not publicly accessible.  

- **Bastion Host:**  
  - Purpose: Provides secure administrative access to private resources.  
  - Impact: Prevents direct public access to databases, improving security posture.  

- **Application Load Balancer (ALB):**  
  - Purpose: Distributes incoming traffic across multiple EC2 instances and routes requests based on path (`/` vs `/api/*`).  
  - Impact: Improves application availability, reduces latency, and ensures seamless scaling for business continuity.  

- **ACM (AWS Certificate Manager):**  
  - Purpose: Provides and manages SSL/TLS certificates.  
  - Impact: Encrypts user data in transit, building customer trust and meeting compliance requirements.  

- **Multi-AZ Deployment:**  
  - Purpose: Application runs in **two Availability Zones**.  
  - Impact: Protects against single AZ failures, ensuring higher uptime and reliability.  

- **DNS (Freenom / Route 53):**  
  - Purpose: Maps human-readable domain names to the ALB endpoint.  
  - Impact: Gives the business a professional presence and improves brand accessibility.  


## Limitations  

- No user authentication system, meaning that transactions are visible to all visitors.  
- Shared state across sessions since data is not tied to individual users.  


##  Tech Stack  

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js (Express)  
- **Database:** PostgreSQL  
- **Cloud Provider:** AWS  
- **Services Used:**  
  - VPC, EC2, Security Groups, Bastion Host  
  - Application Load Balancer (ALB)  
  - Certificate Manager (ACM)  
  - Freenom (domain)  



