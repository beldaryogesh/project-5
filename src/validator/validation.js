
const nameRegex = (value)=>{
    if(/^[a-zA-Z ]{2,30}$/.test(value))
    return true;
}




module.exports={nameRegex}
// // comment