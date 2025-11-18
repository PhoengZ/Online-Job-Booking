const Booking = require('../models/Booking');
const Company = require('../models/Company');
const { handleSlotOpeningNotification } = require('../services/utils');

//@desc    Create Booking
//@route   POST /api/v1/booking
//@access  Public
exports.createBooking = async (req,res) => {
    try{
        const {companyId,timeslotDate} = req.body;
        const userId = req.user._id;
        const date = new Date(timeslotDate);
        //check booking confirmed(<= 3)
        const count = await Booking.countDocuments({
            userId,
            status : "confirmed"
        })
        if(count >= 3){
            return res.status(400).json({success:false,message:"You can only book up to 3 sessions"});
        }

        //Check if booked duplicate time and date
        const duplicateDateTime = await Booking.findOne({
            userId,
            timeslotDate: date,
            status: "confirmed"
        });
        if (duplicateDateTime) {
            return res.status(400).json({
                success: false,
                message: "You already have a booking at this time."
            });
        }


         // Check if already booked this company
        const duplicate = await Booking.findOne({
            userId,
            companyId,
            status : "confirmed"
        });
        //user can book 1 book per company
        if(duplicate){
            return res.status(400).json({success:false,message:"You already booked this company"});
        }

        //Check timeslot capacity
        const company = await Company.findById(companyId);
        if(!company){
            return res.status(404).json({success:false,message:"Company not found"});
        }
        
        const slot = company.timeslots.find(
            s => new Date(s.date).toISOString() === date.toISOString()
        );

        if (!slot){
            return res.status(404).json({success:false,message:"Timeslot not found"});
        }

        if (slot.currentBooked >= slot.capacity) {
            // it full
            return res.status(409).json({
                message: "This timeslot is full. You can like the company to wait for a slot.",
            });
        }

        //create Booking
        const booking = await Booking.create({
            userId,
            companyId,
            timeslotDate : date,
            status : "confirmed"
        });

        //update current book
        slot.currentBooked+=1;
        // console.log(slot.currentBooked);
        await company.save();
        res.status(201).json({ success: true, data: booking });
    }catch(error){
        console.log(error);
        res.status(500).json({message:"Server Error"});
    }
};

//@desc    Cancel Booking
//@route   PUT /api/v1/booking/:id
//@access  Public
exports.cancelBooking = async (req,res) => {
    try{
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            res.status(404).json({success: false , message:"Booking not found"});
        }
        if(booking.status === "cancelled"){
            return res.status(400).json({success:false,message:"You already cancelled this company and timeslot"});
        }

        if (booking.userId.toString() !== req.user._id.toString()) {
            if (req.user.role === "user") {
                return res.status(403).json({ success: false, message: "You cannot access this booking" });
            }
        }
        booking.status = "cancelled";
        await booking.save();
        
        // update currentBooked
        const company = await Company.findById(booking.companyId);
        const slot = company.timeslots.find(
            s => s.date.getTime() === new Date(booking.timeslotDate).getTime()
        );
        if (slot) {
            if (slot.currentBooked > 0){
                slot.currentBooked -= 1;
                await company.save();
            }
            console.log(slot);
            const haveTosent = slot.currentBooked <= (slot.capacity * 0.9);
            console.log(haveTosent);
            
            if (haveTosent){
                // Dont use await for make below line do on background
                handleSlotOpeningNotification(company._id, company.name);
            }
        }
        res.status(200).json({ success: true, message: "Booking cancelled" });

    }catch(error){
        console.log(error);
        res.status(500).json({message:"Server Error"});
    }
};

//@desc    Edit Own Booking
//@route   PUT /api/v1/booking/:id
//@access  Public
exports.editBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        //if booking status cancelled -> cannot edit booking
        if(booking.status === "cancelled" && req.user.role === "user"){
            return res.status(400).json({success:false , message : "This booking is cancelled"});
        }

        // Only owner or admin can edit
        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "You cannot edit this booking" });
        }
        const { timeslotDate, status } = req.body;

        // Only admin can edit status
        if (status && req.user.role === "admin") {
            if (status === "confirmed") {
                const confirmedCount = await Booking.countDocuments({
                    userId: booking.userId,
                    status: "confirmed",
                    _id: { $ne: booking._id } // exclude this booking if it's being updated from another status
                });
                if (confirmedCount >= 3) {
                    return res.status(400).json({ success: false, message: "This user already has 3 confirmed bookings." });
                }
            }
            booking.status = status;
        }

        // Only allow editing timeslotDate for all
        if (timeslotDate) {
            const newDate = new Date(timeslotDate);

            // Check for duplicate booking at new timeslot
            const duplicate = await Booking.findOne({
                userId: booking.userId,
                timeslotDate: newDate,
                status: "confirmed",
                _id: { $ne: booking._id }
            });
            if (duplicate) {
                return res.status(400).json({ success: false, message: "You already have a booking at this time." });
            }

            // Find company and new slot
            const company = await Company.findById(booking.companyId);
            if (!company) {
                return res.status(404).json({ success: false, message: "Company not found" });
            }
            const newSlot = company.timeslots.find(
                s => new Date(s.date).toISOString() === newDate.toISOString()
            );
            if (!newSlot) {
                return res.status(404).json({ success: false, message: "Timeslot not found" });
            }
            if (newSlot.currentBooked >= newSlot.capacity) {
                return res.status(409).json({ success: false, message: "This timeslot is full." });
            }

            // Update old slot's currentBooked
            const oldSlot = company.timeslots.find(
                s => new Date(s.date).toISOString() === booking.timeslotDate.toISOString()
            );
            if (oldSlot && oldSlot.currentBooked > 0) {
                oldSlot.currentBooked -= 1;
            }

            // Update new slot's currentBooked
            newSlot.currentBooked += 1;

            // Update booking
            booking.timeslotDate = newDate;
            await company.save();
        }

        await booking.save();

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

//@desc    View Own Booking
//@route   GET /api/v1/booking
//@access  Public
exports.getBookings = async (req,res) => {
    try{
        let bookings;
        
        //if admin show all booking
        if(req.user.role === 'admin'){
            bookings = await Booking.find();
        }
        //if user show own booking
        else{
            bookings = await Booking.find({userId : req.user._id}).populate('companyId','name');
        }

        res.status(200).json({success:true,count : bookings.length , data : bookings});
    }catch(error){
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
}

//@desc    View each Booking (only admin)
//@route   GET /api/v1/booking/:id
//@access  Public
exports.getBooking = async (req,res) => {
    try{
        if(req.user.role === "user"){
            return res.status(403).json({ success: false, message: "You cannot access this route" });
        }
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.status(200).json({ success: true, data: booking });
    }catch(error){
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
}