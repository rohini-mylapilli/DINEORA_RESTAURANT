

\# DINEORA RESTAURANT



A modern, responsive multi-cuisine restaurant web application.



\## Project Overview



DINEORA is a full-stack restaurant application where customers can explore food items, add products to their cart, log in using OTP verification, and place food orders.



Administrators can manage menu items, view customer orders, and update order statuses through the Django Admin Dashboard.



\## Technology Stack



\### Frontend

\- React.js

\- Vite

\- JavaScript

\- CSS



\### Backend

\- Python

\- Django

\- Django REST Framework

\- Token Authentication



\### Database

\- PostgreSQL (Production)

\- MySQL (Local Development)



\### Deployment

\- Render

\- GitHub



\## Main Features



\- Customer OTP Login

\- Food Categories

\- Food Menu

\- Shopping Cart

\- Checkout

\- Cash on Delivery

\- Customer Orders

\- Django Admin Dashboard

\- Order Status Management



\## Live Application



\*\*Frontend:\*\* https://dineora-restaurant.onrender.com/



\*\*Backend:\*\* https://dineora-backend-drui.onrender.com/



\*\*Admin:\*\* https://dineora-backend-drui.onrender.com/admin/



\## Project Structure



```text

DINEORA\_RESTAURANT/

│

├── backend/

│   ├── accounts/

│   ├── menu/

│   ├── orders/

│   ├── config/

│   └── manage.py

│

├── frontend/

│   ├── src/

│   ├── public/

│   ├── package.json

│   └── index.html

│

└── README.md

```



\## Local Development



\### Backend



```bash

cd backend

python -m venv venv

```



Activate virtual environment and install dependencies:



```bash

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver

```



\### Frontend



```bash

cd frontend

npm install

npm run dev

```



\## Order Workflow



1\. Customer logs in.

2\. Customer selects food items.

3\. Customer adds items to cart.

4\. Customer enters delivery details.

5\. Customer places an order.

6\. Admin views the order.

7\. Admin updates order status.

8\. Customer checks order status in My Orders.



\## Future Enhancements



\- Online Payment Gateway

\- Cloud Image Storage

\- Order Tracking

\- Improved Customer Dashboard

\- Restaurant Analytics



\---



Developed for DINEORA RESTAURANT.



