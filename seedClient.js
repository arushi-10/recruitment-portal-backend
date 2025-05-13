const mongoose = require("mongoose");
const User = require("./models/User");
const Client = require("./models/Client");
const bcrypt = require("bcryptjs");

const connectDB = async () => {
  await mongoose.connect("mongodb+srv://recruitDB:T6U9flqqzrD1RFwe@cluster0.nl9prnm.mongodb.net/recruitmentDB?retryWrites=true&w=majority");
    
  
  console.log("MongoDB connected");
};

const seedClients = async () => {
  await connectDB();
  await User.deleteMany({ role: "client" }); // Optional: clears old clients
  await Client.deleteMany({}); // Optional: clears old client data

  const clientsData = [
    {
      user: {
        name: "Ahmed Al Saadi",
        email: "ahmed@saadicorp.com",
        password:"123456",
        role: "client",
        isApproved: true,
      },
      client: {
        companyName: "Saadi Constructions",
        industry: "Infrastructure & Construction",
        location: "Riyadh, Saudi Arabia",
        website: "https://saadicorp.com",
        contactPerson: {
          name: "Ahmed Al Saadi",
          email: "ahmed@saadicorp.com",
          phone: "+966500123456",
        },
        isPartnered: true,
        status: "approved",
        notes: "Major projects in metro rail and bridges."
      },
    },
    {
      user: {
        name: "Fatima Al Nahyan",
        email: "fatima@emirtech.ae",
        password: "123456",
        role: "client",
        isApproved: true,
      },
      client: {
        companyName: "EmirTech Solutions",
        industry: "IT ",
        location: "Dubai, UAE",
        website: "https://emirtech.ae",
        contactPerson: {
          name: "Fatima Al Nahyan",
          email: "fatima@emirtech.ae",
          phone: "+971501234567",
        },
        isPartnered: true,
        status: "approved",
        notes: "Hiring for multiple software development roles."
      },
    },
    {
      user: {
        name: "Mohammed Al Khoury",
        email: "mohammed@alklogistics.com",
        password: "123456",
        role: "client",
        isApproved: true,
      },
      client: {
        companyName: "ALK Logistics",
        industry: "Logistics & Transportation",
        location: "Abu Dhabi, UAE",
        website: "https://alklogistics.com",
        contactPerson: {
          name: "Mohammed Al Khoury",
          email: "mohammed@alklogistics.com",
          phone: "+971507654321",
        },
        isPartnered: true,
        status: "approved",
        notes: "Looking for warehouse and fleet staff."
      },
    }
  ];

  for (let data of clientsData) {
    const newUser = new User(data.user);
    const savedUser = await newUser.save();

    const newClient = new Client({
      ...data.client,
      userId: savedUser._id,
    });
    await newClient.save();
  }

  console.log("Partnered clients seeded successfully!");
  process.exit();
};

seedClients();