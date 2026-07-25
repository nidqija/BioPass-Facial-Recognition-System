from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from interface import CustomerRegistration

app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)




@app.get("/")
def get_root():
    return {"message": "Hello, World!"}


@app.post("/api/insert-name")
def insert_name(customer: CustomerRegistration):

    return {"message": f"Name '{customer.fullName}' and payment file '{customer.paymentFile}' inserted successfully."}

    

