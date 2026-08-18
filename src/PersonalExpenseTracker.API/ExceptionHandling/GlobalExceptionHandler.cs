using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace PersonalExpenseTracker.API.ExceptionHandling
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            var problemDetails = new ProblemDetails
            {
                Instance = httpContext.Request.Path
            };

            switch (exception)
            {
                case ArgumentException argumentException:
                    problemDetails.Status = StatusCodes.Status400BadRequest;
                    problemDetails.Title = "Bad Request";
                    problemDetails.Detail = argumentException.Message;
                    break;
                case FormatException formatException:
                    problemDetails.Status = StatusCodes.Status400BadRequest;
                    problemDetails.Title = "Bad Request";
                    problemDetails.Detail = formatException.Message;
                    break;
                case InvalidOperationException invalidOperationException:
                    problemDetails.Status = StatusCodes.Status409Conflict;
                    problemDetails.Title = "Conflict";
                    problemDetails.Detail = invalidOperationException.Message;
                    break;
                case UnauthorizedAccessException unauthorizedAccessException:
                    problemDetails.Status = StatusCodes.Status401Unauthorized;
                    problemDetails.Title = "Unauthorized";
                    problemDetails.Detail = unauthorizedAccessException.Message;
                    break;
                default:
                    _logger.LogError(exception, "Ha ocurrido un error inesperado.");
                    problemDetails.Status = StatusCodes.Status500InternalServerError;
                    problemDetails.Title = "Internal Server Error";
                    problemDetails.Detail = "Ha ocurrido un error inesperado al procesar la solicitud.";
                    break;
            }

            httpContext.Response.StatusCode = problemDetails.Status.Value;

            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

            return true;
        }
    }
}
