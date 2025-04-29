function errorWarning(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  switch (err.name) {
    case "Error":
      status = 500;
      message = "Internal Server Error";
      break;
    case "ValidationError":
      status = 400;
      message = "Invalid Input";
      break;
    case "Unauthorized":
      status = 401;
      message = "Invalid Token";
      break;
    case "InvalidEmailOrPassword":
      status = 401;
      message = "Email not found or Password not match";
      break;
    case "ExistingData":
      status = 402;
      message = "Data already exists";
      break;
    case "Forbidden":
      status = 403;
      message = "Not authorized";
      break;
    case "NotFound":
      status = 404;
      message = "Not found";
      break;
  }

  console.log("ERROR GILAAA >>>>", err);
  res.status(status).json({ message });
}

export default errorWarning;
``;
