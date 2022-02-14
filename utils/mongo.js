import mongoose from "mongoose";




export const mongodbConnection = async () => {
    const ID = process.env.ID
    const password = process.env.DBPW;
    const DBaddress = process.env.DBaddress;
    const DBport = process.env.DBport;
    const DBname = process.env.DBNAME;

    ////MongoDB Atlas
    // const uri = `mongodb+srv://test-user-0:${password}@clusters.e1lkc.mongodb.net/${dbName}?retryWrites=true&w=majority`;
    // const uri = `mongodb+srv://gomin:${password}@cluster0.ieksj.mongodb.net/${dbName}?retryWrites=true&w=majority`

    ////몽고DB 설치
    //`mongodb://${ID}:${password}@${DBaddress}:${DBport}/${스키마명}
    const uri = `mongodb://${ID}:${password}@${DBaddress}:${DBport}/${DBname}`;
    mongoose.Promise = global.Promise;

    try {
        await mongoose
            .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, retryWrites: false });
        return console.log("MongoDB Connected...");
    } catch (err) {
        return console.log(err);
    };
};

