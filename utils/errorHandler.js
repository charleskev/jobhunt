/**
 * Render error page with standardized format
 */
export const renderError = (res, statusCode = 500, message = "An error occurred", title = "Error") => {
  const errorCodes = {
    400: "Bad Request",
    403: "Forbidden",
    404: "Not Found",
    500: "Server Error"
  };

  res.status(statusCode).render("error", {
    code: statusCode,
    title: errorCodes[statusCode] || title,
    message: message
  });
};

export default renderError;
