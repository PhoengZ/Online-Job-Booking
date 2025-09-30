const Booking = require('../models/Booking');
const Company = require('../models/Company');

//@desc    Create Booking
//@route   POST /api/v1/booking
//@access  Public
exports.createBooking = async (req,res) => {
    try{
        const {companyId,timeslotDate} = req.body;
        const userId = req.user._id;
        const date = new Date(timeslotDate);
        //Check Date
        const start = new Date("2022-05-10T00:00:00Z");
        const end = new Date("2022-05-13T23:59:59Z");
        //if not in range
        if (date < start || date > end) {
            return res.status(400).json({ msg: "Date must be between May 10-13, 2022" });
        }

        //check booking confirmed(<= 3)
        const count = await Booking.countDocuments({
            user : userId,
            status : "confirmed"
        })
        if(count >= 3){
            return res.status(400).json({success:false,message:"You can only book up to 3 sessions"});
        }

         // Check if already booked this company + timeslot
        const duplicate = await Booking.findOne({
            userId,
            companyId,
            status: "confirmed"
        });
        if(duplicate){
            return res.status(400).json({success:false,message:"You already booked this company and timeslot"});
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

        const bookedCount = await Booking.countDocuments({
            companyId,
            timeslotDate : date,
            status: "confirmed"
        });

        if (bookedCount >= slot.capacity) {
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
        slot.currentBooked = bookedCount + 1;
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

        booking.status = "cancelled";
        await booking.save();

        
    // update currentBooked
    const company = await Company.findById(booking.company);
    const slot = company.timeslots.find(
      s => s.date.getTime() === booking.timeslot.date.getTime()
    );
    if (slot && slot.currentBooked > 0) {
      slot.currentBooked -= 1;
      await company.save();
    }

    // notification user that like this company
    //........

    res.status(200).json({ success: true, message: "Booking cancelled" });

    }catch(error){
        console.log(error);
        res.status(500).json({message:"Server Error"});
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
        res.status(400).json({success:false})
    }
}

//@desc    Edit Own Booking
//@route   PUT /api/v1/booking/:id
//@access  Public
exports.editBooking = async (req,res) => {
    try{

    }catch(error){

    }
}