process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer");
const collection_signup = require("./database")

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.static("style"))
app.use(express.urlencoded({extended:false}))

const html_data = `
    <h1>Message received</h1>
    <h1>Thank you for using SD agency</h1>
`

//urls
app.locals.name_hello = "no";
app.locals.user_email = "no";
app.locals.schedule = "no";
app.locals.counter1 = 0

app.get("/", async (req,res)=>{
    if(app.locals.counter1 > 0)
    {
        const data2 = await collection_signup.findOne({email: app.locals.user_email})
        app.locals.schedule = data2.scheduled_list
        console.log(app.locals.schedule)
    }
    res.render(__dirname + "/view/main.ejs",{hello_object: app.locals.name_hello, users_email: app.locals.user_email, schedule_data:app.locals.schedule})
    app.locals.invalid_data = 0;
    app.locals.invalid_data_login = 0;
})

app.locals.invalid_data_login = 0;
app.get("/login",(req,res)=>{
    res.render(__dirname + "/view/login.ejs",{object2:app.locals.invalid_data_login})
    app.locals.invalid_data_login = 0
})

app.locals.invalid_data = 0;

app.get("/signup",(req,res)=>{
    res.render(__dirname + "/view/signup.ejs",{object1:app.locals.invalid_data})
    app.locals.invalid_data = 0
})



app.post("/contactus",async (req,res)=>{
    
    const export_email = req.body.email
    const export_subject = req.body.subject
    console.log(export_subject)
    console.log(export_email)

    const transporter = nodemailer.createTransport({

        service:"gmail",
        host: "smtp.gmail.com",
        port: 535,
        secure: false,
        auth: {
            user: "sd.property.agency@gmail.com",
            pass: "yofm lnvv dgve rgvb",
        }
    });

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"SD Agency" <sd.property.agency@gmail.com>', // sender address
        to: export_email, 
        subject: export_subject, 
        html: html_data,
    });

    console.log("Message sent: %s", info.messageId);
    
    }

    main().catch(console.error);

    //res.status(204).send()
    res.redirect("/")
})

app.post("/scheduleavisit", async (req,res)=>{
    console.log(req.body.input_schedule)
    console.log(req.body.property_data)


    const data_schedule = "!"+req.body.input_schedule + "#" +req.body.property_data

    const find_data = await collection_signup.findOne({email: app.locals.user_email})
    const user_id = find_data._id;
    const update_data = await collection_signup.updateOne(
        {_id:user_id},
        {$push: {scheduled_list: data_schedule}}
    )
    
    console.log(user_id)
    console.log(find_data.scheduled_list)

    res.redirect("/")
})

app.get("/myschedule", async (req,res)=>{
    if(app.locals.schedule != "no")
    {
        const data2 = await collection_signup.findOne({email: app.locals.user_email})
        app.locals.schedule = data2.scheduled_list
    }
    console.log(app.locals.schedule)
    res.status(204).send({});
})

//signup code

app.locals.invalid_data = 0;
app.post("/signupdata",async (req,res)=>{
    app.locals.counter1 += 1;
    const data = {
        name: req.body.fullname,
        email: req.body.email,
        password: req.body.password
    }
    
    const existuseremail = await collection_signup.findOne({email: data.email})
    const existingpassword = await collection_signup.findOne({password: data.password})

    if(existuseremail && existingpassword)
    {
        app.locals.invalid_data += 1
        res.redirect("/signup")

    }

    else if(existingpassword)
    {
        app.locals.invalid_data += 1
        res.redirect("/signup")

    }

    else if(existuseremail)
    {
        app.locals.invalid_data += 1
        res.redirect("/signup")
    }
    else{

        const saltrounds = 10;
        const hashedPassword = await bcrypt.hash(data.password,saltrounds)
        data.password = hashedPassword; //replace pasword
        const userdata = await collection_signup.insertMany(data);
        app.locals.invalid_data = 0
        app.locals.name_hello = data.name;
        app.locals.user_email = data.email;
        res.redirect("/")
        
    }

})
app.post("/logindata",async (req,res)=>{
    try{
        app.locals.counter1 += 1;
        const check = await collection_signup.findOne({email:req.body.email})
        
        if(!check){
            app.locals.invalid_data_login += 1;
            res.redirect("/login")
        }
        else{
            const ispasswordmatch = await bcrypt.compare(req.body.password, check.password)
            if(ispasswordmatch)
            {
                app.locals.name_hello = check.name
                app.locals.user_email = check.email
                res.redirect("/")
            }else{
                app.locals.invalid_data_login += 1;
                res.redirect("/login")
            }
        }
    }
    catch{
        app.locals.invalid_data_login += 1;
        res.redirect("/login")
    }
})


const port = 3000
app.listen(port,()=>{
    console.log("Server is running")
})