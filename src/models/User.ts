import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    hash: {type: String, required: true},
    imageUri: {type: String, required: false},
    confirmed: {type: Boolean, required: true},
    contacts: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }],
},{
    timestamps: true
});

userSchema.statics.findByEmail = function(email: string) {
    return this.where({email: email});
}

userSchema.statics.updateAvatar = function(id: string, path: string) {
    return this.findOneAndUpdate({_id: id}, { imageUri: path });
}

const User = mongoose.model("User", userSchema);

module.exports = User;