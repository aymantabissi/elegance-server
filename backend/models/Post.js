import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({  
    description: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: Object,
        
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    nextEarningDate:{
        type: Date,
        default: ()=>
            new Date(new Date().getFullYear(), new Date().getMonth()+1,1 )
    },
    thisMonthEarning:{
        type: Number,
        default: 0
    },
    totalEarning:{
        type: Number,
        default: 0
    },
    category:{
        type: String,
        required: true,
    },
    viwsCount:{
        type: Number,
        default: 0
    },
    likes:{
        type:mongoose.Schema.Types.ObjectId,ref:'User'
    },
    dislikes:{
        type:mongoose.Schema.Types.ObjectId,ref:'User'
    },
    viewers:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
}, { timestamps: true });
const Post = mongoose.model('Post', postSchema);
export default Post;
     
