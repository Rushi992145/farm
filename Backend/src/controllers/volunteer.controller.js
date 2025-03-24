import {asyncHandler} from "../utils/asyncHandler.js";
import Volunteer from "../models/volunteer.model.js";
import User from "../models/user.model.js";
import Disaster from "../models/disaster.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Register a new volunteer
const updateVolunteer = asyncHandler(async (req, res) => {
    const { userId, skills, availability, address, bloodGroup, aadharNumber, familyContact, emergencyContact, assignedDisaster } = req.body;
    console.log(req.body);
    // Validate required fields
    if (!userId || !bloodGroup || !aadharNumber || !emergencyContact) {
        throw new ApiError(400, "Missing required fields");
    }

    // Validate availability type
    if (!["Full-time", "Part-time", "On-call"].includes(availability)) {
        throw new ApiError(400, "Invalid availability type");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Find the volunteer by userId (since userId is a field, not _id)
    let volunteer = await Volunteer.findOne({ userId });

    if (volunteer) {
        // Update existing volunteer
        volunteer.skills = skills;
        volunteer.availability = availability;
        volunteer.address = address;
        volunteer.bloodGroup = bloodGroup;
        volunteer.aadharNumber = aadharNumber;
        volunteer.familyContact = familyContact;
        volunteer.emergencyContact = emergencyContact;
        volunteer.assignedDisaster = assignedDisaster;

        await volunteer.save();

        return res.status(200).json(new ApiResponse(200, volunteer, "Volunteer updated successfully"));
    } else {
        // Create new volunteer if not found
        volunteer = await Volunteer.create({
            userId,
            skills,
            availability,
            address,
            bloodGroup,
            aadharNumber,
            familyContact,
            emergencyContact,
            assignedDisaster
        });

        return res.status(201).json(new ApiResponse(201, volunteer, "Volunteer registered successfully"));
    }
});

const getVolunteerDetails = async (req, res) => {
    try {
      const { id } = req.body; // Extract volunteer ID from URL params
    
      console.log(id);
      const volunteer = await Volunteer.findOne({ userId: id }); // Fetch volunteer details from DB
      if (!volunteer) {
        return res.status(404).json({ message: "Volunteer not found" });
      }

      res.status(200).json(volunteer); // Return volunteer details
    } catch (error) {
      console.error("Error fetching volunteer details:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

// Get all volunteers
const getAllVolunteers = asyncHandler(async (req, res) => {
    const volunteers = await Volunteer.find()
        .populate("userId", "name email")
        .populate("assignedDisaster", "location severity status")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, volunteers, "All volunteers fetched successfully"));
});

// Get volunteers by status
const getVolunteersByStatus = asyncHandler(async (req, res) => {
    const { status } = req.params;

    if (!["Available", "Assigned", "Inactive"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const volunteers = await Volunteer.find({ status })
        .populate("userId", "name email")
        .populate("assignedDisaster", "location severity status");

    if (!volunteers.length) {
        throw new ApiError(404, "No volunteers found for this status");
    }

    return res.status(200).json(new ApiResponse(200, volunteers, `Volunteers with status '${status}' fetched successfully`));
});

// Update volunteer status
const updateVolunteerStatus = asyncHandler(async (req, res) => {
    const { volunteerId } = req.params;
    const { status } = req.body;
    console.log(req.body);

    if (!["Available", "Assigned", "Inactive"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
        throw new ApiError(404, "Volunteer not found");
    }

    volunteer.status = status;
    await volunteer.save();

    return res.status(200).json(new ApiResponse(200, volunteer, `Volunteer status updated to ${status}`));
});



// Assign a volunteer to a disaster
const assignVolunteerToDisaster = asyncHandler(async (req, res) => {
    const { volunteerId, disasterId } = req.body;

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
        throw new ApiError(404, "Volunteer not found");
    }

    const disaster = await Disaster.findById(disasterId);
    if (!disaster) {
        throw new ApiError(404, "Disaster not found");
    }

    volunteer.assignedDisaster = disasterId;
    volunteer.status = "Assigned";
    await volunteer.save();

    return res.status(200).json(new ApiResponse(200, volunteer, "Volunteer assigned to disaster successfully"));
});

// Remove a volunteer from a disaster
const removeVolunteerAssignment = asyncHandler(async (req, res) => {
    const { volunteerId } = req.params;

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
        throw new ApiError(404, "Volunteer not found");
    }

    volunteer.assignedDisaster = null;
    volunteer.status = "Available";
    await volunteer.save();

    return res.status(200).json(new ApiResponse(200, volunteer, "Volunteer assignment removed successfully"));
});

export {
    updateVolunteer,
    getAllVolunteers,
    getVolunteersByStatus,
    updateVolunteerStatus,
    assignVolunteerToDisaster,
    removeVolunteerAssignment,
    getVolunteerDetails
};
