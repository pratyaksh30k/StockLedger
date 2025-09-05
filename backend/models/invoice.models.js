import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    type:{
        type: String,
        required: true,
    },
    qty:{
        type: Number,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    gst:{
        type: Number,
        required: true,
    },
    total:{
        type: Number,
        required: true,
    }
},{_id:false});

const invoiceSchema = new mongoose.Schema({
    invoiceNo:{
        type: Number,
        required: true,
        unique: true,
    },
    customerName:{
        type: String,
        required: true,
    },
    customerNumber:{
        type: String,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now,
    },
    items:{
        type: [invoiceItemSchema],
        required: true,
    },
    subTotal:{
        type: Number,
        required: true,
    },
    gstTotal:{
        type: Number,
        required: true,
    },
    totalAmount:{
        type: Number,
        required: true,
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
},{timestamps:true});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;