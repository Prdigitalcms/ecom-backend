import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chouhanujjwalsingh20@gmail.com",
    pass: process.env.App_password,
  },
});

export const sendMail = async (to, subject, htmlContent) => {
  let info = {
    from: "chouhanujjwalsingh20@gmail.com",
    to,
    subject,
    html: htmlContent,
  };

  return await transporter.sendMail(info);
};
export const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: "chouhanujjwalsingh20@gmail.com",
    to,
    subject: "Your OTP Code",
    html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes.</p>`,
  });
};





//   auth: {
//     user: "ddhote780@gmail.com",
//     pass: "lxbtuydurvqjqulp",
//   },
// });

// 
//   let info = {
//     from: "ddhote780@gmail",
//     to,
//     subject,
//     html: htmlContent,
//   };

//   return await transporter.sendMail(info);
// };
