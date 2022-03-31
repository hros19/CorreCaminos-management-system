/**
 * ~~~~~~~ SUCESS RESPONSES
 * 200 - OK
 * Info in the message body.
 * GET, PUT, POST.
 * 
 * 201 - CREATED
 * New resource created as a result.
 * PUT, POST.
 * 
 * 202 - ACCEPTED
 * Request received but no acted.
 * 
 * 203 - NON-AUTHORITATIVE INFORMATION
 * Returned metadata is not exactly the same as available from the origin server.
 * 
 * 204 - NO CONTENT
 * Headers are useful but no content sent.
 * 
 * 205 - RESET CONTENT
 * Tells the user to reset the document which sent this request.
 * 
 * 206 - PARTIAL CONTENT
 * Header sent from the client to the request only part of a resource.
 * 
 * ~~~~~~~~ REDIRECTION MESSAGES
 * 300 - MULTIPLE CHOICE
 * Request with more than one possible response. The user should choose on of them.
 * 
 * 301 - Moved Permanently
 * The URI request has been changed permanently. New URI given in resposne.
 * 
 * 302 - FOUND
 * URI requested has been changed temporarily.
 * 
 * 303 - SEE OTHER
 * Server send response to the client to get the requested resource to another URI.
 * 
 * 304 - NOT MODIFIED
 * Tells the client that the response has not been modified, the client can use
 * the same cached version of the response.
 * 
 * 307 - TEMPORARY REDIRECT
 * Server send this to the client to get the requested resource to another URI with
 * the same method that was used in the prior request.
 * 
 * 308 - PERMANENT REDIRECT
 * Resource is now permanently located at another URI, specified in the response header.
 * 
 * ~~~~~~~~ ERROR RESPONSES
 * 400 - BAD REQUEST
 * Server cannot o will not process the request.
 * (malformed req syntax, invalid request message framing)
 * 
 * 401 - UNAUTHORIZED
 * The client must authenticate itself to get the requested response.
 * 
 * 403 - FORBIDDEN
 * The client does not have access rights to the content. In this case the clients
 * identity is know to the server.
 * 
 * 404 - NOT FOUND
 * Server cannot find the requested resource. URI not recognized.
 * 
 * 405 - METHOD NOT ALLOWED
 * Request method know by the server but no supported by the target resource.
 * 
 * 406 - NOT ACCEPTABLE
 * When after server driver content negotiaton, doesnt find any content that conforms to the criterio given by the user.
 * 
 * 407 - PROXY AUTHENTICATION REQUIRED
 * Similar to (401) but authentication is needed to be done by proxy.
 * 
 * 408 - REQUEST TIMEOUT
 * When server would like to shut down this unused connection.
 * 
 * 409 - CONFLICT
 * When a request conflicts with the current state of the server
 * 
 * 410 - GONE
 * When requested content has been permanently deleted from the server, with no forwarding address.
 * 
 * 411 - LENGTH REQUIRED
 * Server rejected the request because the 'Content-Length' is not defined and server requires it.
 * 
 * 412 PRECONDITION FAILED
 * Client has indicated preconditions in its headers which the server does not meet
 * 
 * 413 PAYLOAD TOO LARGE
 * Request entity is larger than limits defined by server.
 * 
 * 414 URI TOO LONG
 * When URI requested is longer than the server is willing to interpret.
 * 
 * 415 UNSUPPORTED MEDIA TYPE
 * Media format of the requested data is not supported by the server.
 * 
 * 416 RANGE NOT SATISFIABLE
 * Range specified in header field in the request cannot be fulfilled.
 * 
 * 417 EXPECTATION FAILED
 * Expectation indicated in the request cannot be met by the server.
 * 
 * 421 MISDIRECTED REQUEST
 * Server not able to produce a response.
 * 
 * 426 UPGRADE REQUIRED
 * Server refuses to perform the request using the current protocol
 * 
 * 429 TOO MANY REQUESTS
 * 
 * ~~~~~ SERVER ERROR RESPONSES
 * 500 INTERNAL SERVER ERROR
 * The server doesnt know how to handle the situation.
 * 
 * 501 NOT IMPLEMENTED
 * Request method is not supported by the server and cannot be handled.
 * 
 * 502 BAD GATEWAY
 * The server while working as a gateway got an invalid response
 * 
 * 503 SERVICE UNAVAILABLE
 * Server not ready to hanlde the request.
 * 
 * 504 GATEWAY TIMEOUT
 * When server is acting as a gateway and cannot get response in time.
 * 
 * 505 HTTP VERSION NOT SUPPORTED
 * 
 * 510 NOT EXTENDED
 * Further extensions to the request are required for the server to fulfill it.
 * 
 * 511 NETWORK AUTHENTICATION REQUIRED
 * The client needs to authenticate to gain network access.
 * 
 */

const HttpStatus = {
  OK: { code: 200, status: 'OK' },
  CREATED: { code: 201, status: 'CREATED' },
  ACCEPTED: { code: 202, status: 'ACCEPTED' },
  NON_AUTHORITATIVE_INFORMATION: { code: 203, status: 'NON_AUTHORITATIVE_INFORMATION' },
  NO_CONTENT: { code: 204, status: 'NO_CONTENT' },
  RESET_CONTENT: { code: 205, status: 'RESET_CONTENT' },
  PARTIAL_CONTENT: { code: 206, status: 'PARTIAL_CONTENT' },
  MULTIPLE_CHOICE: { code: 300, status: 'MULTIPLE_CHOICE' },
  MOVED_PERMANENTLY: { code: 301, status: 'MOVED_PERMANENTLY' },
  FOUND: { code: 302, status: 'FOUND' },
  SEE_OTHER: { code: 303, status: 'SEE_OTHER' },
  NOT_MODIFIED: { code: 304, status: 'NOT_MODIFIED' },
  TEMPORARY_REDIRECT: { code: 307, status: 'TEMPORARY_REDIRECT' },
  PERMANENT_REDIRECT: { code: 308, status: 'PERMANENT_REDIRECT' },
  BAD_REQUEST: { code: 400, status: 'BAD_REQUEST' },
  UNAUTHORIZED: { code: 401, status: 'UNAUTHORIZED' },
  FORBIDDEN: { code: 403, status: 'FORBIDDEN' },
  NOT_FOUND: { code: 404, status: 'NOT_FOUND' },
  METHOD_NOT_ALLOWED: { code: 405, status: 'METHOD_NOT_ALLOWED' },
  NOT_ACCEPTABLE: { code: 406, status: 'NOT_ACCEPTABLE' },
  PROXY_AUTHENTICATION_REQUIRED: { code: 407, status: 'PROXY_AUTHENTICATION_REQUIRED' },
  REQUEST_TIMEOUT: { code: 408, status: 'REQUEST_TIMEOUT' },
  CONFLICT: { code: 409, status: 'CONFLICT' },
  GONE: { code: 410, status: 'GONE' },
  LENGTH_REQUIRED: { code: 411, status: 'LENGTH_REQUIRED' },
  PRECONDITION_FAILED: { code: 412, status: 'PRECONDITION_FAILED' },
  PAYLOAD_TOO_LARGE: { code: 413, status: 'PAYLOAD_TOO_LARGE' },
  URI_TOO_LONG: { code: 414, status: 'URI_TOO_LONG' },
  UNSUPPORTED_MEDIA_TYPE: { code: 415, status: 'UNSUPPORTED_MEDIA_TYPE' },
  RANGE_NOT_SATISFIABLE: { code: 416, status: 'RANGE_NOT_SATISFIABLE' },
  EXPECTATION_FAILED: { code: 417, status: 'EXPECTATION_FAILED' },
  MISDIRECTED_REQUEST: { code: 421, status: 'MISDIRECTED_REQUEST' },
  UPGRADE_REQUIRE: { code: 426, status: 'UPGRADE_REQUIRED' },
  PRECONDITION_REQUIRED: { code: 428, status: 'PRECONDITION_REQUIRED' },
  TOO_MANY_REQUESTS: { code: 429, status: 'TOO_MANY_REQUESTS' },
  REQUEST_HEADER_FIELDS_TOO_LARGE: { code: 431, status: 'REQUEST_HEADER_FIELDS_TOO_LARGE' },
  UNAVAILABLE_FOR_LEGAL_REASONS: { code: 451, status: 'UNAVAILABLE_FOR_LEGAL_REASONS' },
  INTERNAL_SERVER_ERROR: {  code: 500, status: 'INTERNAL_SERVER_ERROR' },
  NOT_IMPLEMENTED: { code: 501, status: 'NOT_IMPLEMENTED' },
  BAD_GATEWAY: { code: 502, status: 'BAD_GATEWAY' },
  SERVICE_UNAVAILABLE: { code: 503, status: 'SERVICE_UNAVAILABLE' },
  GATEWAY_TIMEOUT: { code: 504, status: 'GATEWAY_TIMEOUT' },
  HTTP_VERSION_NOT_SUPPORTED: { code: 505, status: 'HTTP_VERSION_NOT_SUPPORTED' },
  VARIANT_ALSO_NEGOTIATES: { code: 506, status: 'VARIANT_ALSO_NEGOTIATES' },
  NOT_EXTENDED: { code: 510, status: 'NOT_EXTENDED' },
  NETWORK_AUTHENTICATION_REQUIRED: { code: 511, status: 'NETWORK_AUTHENTICATION_REQUIRED' }
}