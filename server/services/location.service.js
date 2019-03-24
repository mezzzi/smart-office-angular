const Location = require('../models/location.model')
const config = require('../config')
const mongoose = require('mongoose')


//get all locations
exports.getAllLocation = ()=>{
    return new Promise((succeed, fail) => {
        Location.find({
            location_status: "active"
        }, (err, locations) =>{
            if (err){
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else if (locations.length > 0){
                succeed({
                    status: 200,
                    data: locations,
                    success: true
                })
            } else {
                fail({
                    status: 404,
                    success:false,
                    msg: 'no location found'
                })
            }
        })
    })
}

//get location by name
exports.getLocationByName = (name) => {
    return new Promise((succeed, fail) => {
        Location.find({
            name: new RegExp(`^${name.toLowerCase()}`, "i"),
            location_status: "active"
        }, (err, locations) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else if (locations.length > 0) {
                succeed({
                    status: 200,
                    data: locations,
                    success: true
                })
            } else {
                fail({
                    status: 404,
                    success: false,
                    msg: 'no location found'
                })
            }
        })
    })
}
//add a location 
exports.addLocation = (location) => {
    return new Promise((succeed, fail) => {
        location = new Location(location)
        location.save(err => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 201,
                    data: location,
                    success: true
                })
            }
        })
    })
}

// remove location by ID
exports.removeLocationById = (id) => {
    return new Promise((success, fail) => {
        _id = mongoose.Types.ObjectId(id)
        if (!_id) {
            fail({
                status: 404,
                success: false,
                msg: "not Valid id"
            })
        } else {
            Location.findOneAndUpdate({
                _id: mongoose.Types.ObjectId(id),
            }, {
                    $set: { location_status: "inactive" }
                }, { new: true },
                (err, location) => {
                    if (err) {
                        fail({
                            status: 500,
                            error: err,
                            success: false
                        })
                    } else if (location) {
                        success({
                            status: 200,
                            data: location,
                            success: true
                        })
                    } else {
                        fail({
                            status: 404,
                            success: false,
                            msg: "location not found"
                        })
                    }
                })
        }
    })
}
// update location by ID
exports.updateLocationById = (id, body) => {
    return new Promise((succeed, fail) => {
        _id = mongoose.Types.ObjectId(id)
        if (!_id) {
            fail({
                status: 404,
                success: false,
                msg: "invalid object id"
            })
        } else {
            Location.findByIdAndUpdate(
                {
                    _id: id,
                    location_status: "active"
                }, {
                    $set: { ...body }
                }, { new: true }, (err, location) => {
                    if (err) {
                        fail({
                            status: 500,
                            error: err,
                            success: false
                        })
                    } else if (location) {
                        succeed({
                            status: 201,
                            data: location,
                            success: true
                        })
                    } else {
                        fail({
                            status: 404,
                            success: false,
                            msg: "location not found"
                        })
                    }
                })
        }
    })
}
// get location details by id
exports.getLocationById = id => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                msg: "Location not found"
            })
        } else {
            Location.findOne({
                _id: mongoose.Types.ObjectId(id),
                location_status: 'active',
            }, (err, location) => {
                if (err) {
                    fail({
                        status: 500,
                        success: false,
                        error: err
                    })
                } else {
                    succeed({
                        status: 200,
                        data: location,
                        success: true
                    })
                }
            })
        }
    })
}
