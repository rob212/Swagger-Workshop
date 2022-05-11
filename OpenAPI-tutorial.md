# Swagger Workshop part 1 - building an OpenAPI 2.0 document

## OpenAPI vs Swagger

Swagger in 2011 due to the sudden burst of RESTful API being developed with no consistent approach for documenting them. In 2015 the Swagger specification was donated to the OpenSource community and became the OpenAPI Specification 2.0. 

In 2017 the OpenAPI Spec 3.0 was launched. So when you hear the terms OpenAPI think specification and Swagger is the tooling around working with OpenAPI complaint APIs and documentation. 

## Swagger Tools

* Swagger Editor - A web browser based tool to assist you in the creation and editing of Open API documents. These are created via YAML files (```.yaml```)
* Swagger UI - A web based tool that generates pretty documentation based on the Open API definitions in a spec (i.e. YAML file)
* Swagger Inspector - A web browser based tool for sending/recieving requests, (Swagger's version of Postman)
* Swagger CodeGen - Transforms Open API documents into complete client SDK and server stubs in a variety of languages/frameworks (Java/Spring, JS/Node etc.)

## Swagger Editor

The editor can be run via Docker locally on your machine:

```bash
docker pull swaggerapi/swagger-editor

docker run -d -p 76:8080 swaggerapi/swagger-editor
```

> For more info on Running Swagger Editor locally, see: https://github.com/swagger-api/swagger-editor

Swagger Editor allows us to define our Open API compliant document in YAML (Yet Another Markup Language).


### Your first Open API 2.0 Spec

The first line is the *version* field. The name of the field is ```swagger``` and the version is ```2.0```.

```yaml
swagger: '2.0
```

>Note: if this was an Open API 3.0 spec this version field is ```openapi: '3.0.X'```

The next field is ```info``` which contains metadata for our OpenAPI document. After the colon you need to go to the next line and indent *exactly two spaces*. This is YAML syntax and nothing to do with OpenAPI iteself. 

```yaml
swagger: "2.0"
info:
  title: "Test Lab Bookstore"
  description: "Test Lab Book Store API"
  version: "1.0.0"
  contact:
    email: "robert.mcbryde@ros.gov.uk"
  license:
    name: "Apache 2.0"
    url: "http://www.apache.org/licenses/LICENSE-2.0.html"
```

#### Adding Paths 

The ```paths``` key documents the available endpoints in our API. Let's start by adding a get endpoint for retrieving data:

```yaml
paths:
  /books:
    get:
      summary: "returns all books"
      operationalId: getBooks
      description: "This operation returns a collection of all of the available books that exist on the server"
```

The *summary* is used purely as documentation to relay the purpose of the endpoint. 
The *operationId" field is a name for the operation. If the Swagger CodeGen tool is used this is the name that the generated method/function will be given that represents this operation. 

The next field we will add is *produces*. This field indicates the format of the data returned by the operation. We use inustry standard ```MIME``` types e.g. ```application/json```, ```text/xml```, ```image/jpeg``` etc...

The *produces* field takes an array of MIME types. In YAML an array is represented by a ```-```:

```yaml
produces:
  - application/json
    text/xml
    text/cvs
```

In our example we just want to includes ```application/json``` so our produes field is just an array with one entry:

```yaml
produces:
  - application/json
```

There is a complementary *consumes* field which defines the format of the data that the body of the requests our API will receive contains. If you are defining a ```GET``` request endpoint, consumes is not required as they do not contain a *body*. 

> Note: *produces* and *consumes* no longer exist in Open API Spec 3.0 

The *parameters* field contains an ordered list of five objects. These objects are:
* in - in which part of the HTTP request, the parameter can be found. Query, path, headers, body or formData
* name - the name of the parameter correspoding to the in type
* description - purely for documentation
* required - *true* if this a mandatory parameter 
* type - the data type of the parameter. E.g string, int, etc

```yaml
parameters:
  - in: "path"
    name: "invoiceNumber"
    description: "invoiceNumber to queery for"
    required: true
    type: "string"
```

The *responses* field defines the possible HTTP status code and any data associated with those statuses that our API will response to requests with. 

The response also needs to describe the data it will return. We do this via either the *header* or *schema* field. We will use a schema to indicate the data will be in the HTTP body of the response. 

Under *schema* is the *type* field which describes whether the data is a single JSON primitive (integer, number, string, boolean, etc ). A JSON object, or a JSON list. 

If we select *object* we then define the structure of the objects data via the nested *properties* field. 


```yaml
responses:
  200:
    description: "successful operation"
    schema:
      type: object
      properties:
        myFirstProperty:
          type: string
          description: "A description of my property"
          example: "sponge cake"
```

If your reponse is a JSON list then we have to define it's type as *array* and add an addition *items* field which then go on to define the properties of a singular item in the list:

```yaml
responses:
  200:
    description: "successful operation"
    schema:
      type: array
      items:
        properties:
          myFirstProperty:
            type: string
            description: "A description of my first property"
          mySecondProperty:
            type: integer
            description: "A description of my second property"
```

### Open API references

As you can imagine defining our data types like we did above for our response can get quite verbose and highly repetitive. It is likely we will have to repeat the same definitions for GET, POST and PUT endpoints. 

In order to prevent this repetition, the Open API spec allows us to define this data once and reference it as often as we like via *refs*. Let's cut our object definition from the *schema* down and place it in a reference. 

```yaml
 responses:
        200:
          description: "successful operation"
          schema: 
            $ref: "#/definitions/BookList" 
definitions:
  Book:
    type: object
    properties:
      isbn:
        type: "string"
        description: "String representation of the books ISBN number"
      title:
        type: "string"
        description: "The title of the book"
      author: 
        type: "string"
        description: "The author(s) of the book"
      id:
        type: integer
        description: "The id of the book"
        
  BookList:
    type: array
    items:
        $ref: '#/definitions/Book'
```

### Host and baseURL

We can define the host or domain name of where our API will be hosted using the *host* field which is placed at the first level of our OpenAPI document. 

```yaml
host: "localhost:3000"
```

In addition to this we can append a *basePath* to this host for all of the endpoints defined in this document. Allowing us better control over API versioning or renaming: 

```yaml
host: "localhost:3000"
basePath: "/store/v1"
```

Finally we can define whether our API supports HTTP or HTTPS via the *schemes* field: 

```yaml
schemes:
  - "http"
  - "https"
```

This means that in order to send a GET request to our API to return all books, the client doing so needs to send their request to an address like:

```txt
http://localhost:3000/store/v1/books
```

## Authorization 

Open API Spec 2.0 supports three types of authentication:
* basicAuth
* API key
* OAuth 2

Our document can include no authentication or up to all three in any combination. I'll demonstrate basicAuth which is supported in HTTP as a username and password requirement. 

We add the following fields to the first level of our OpenAPI document:

```yaml
securityDefinitions:
  basicAuth:
    type: basic
```

We can then specifically require a valid username and password are required when a client attempts to send a request to a particular endpoint. For example, lets protect our system by only allowing authenticated users to create a new book via our POST enpoint we defined earlier:

```yaml
/book:
    post:
      summary: "create a new book on server"
      operationId: "createBook"
      produces:
        - "text/plain"
      consumes:
        - "application/json"
      parameters:
        - in: body
          name: "body"
          description: "the new book details in JSON format"
          required: true
          schema:
            $ref: "#/definitions/Book"
      responses:
        201:
          description: "successful operation"
          schema:
            type: integer
        405:
          description: "Invalid input"
      security:
        - BasicAuth: []
```

## More reading

For all the available configurations in OpenAPI Spec 2.0 see the following reference: https://swagger.io/specification/v2/ 

It has very clear instructions and examples of use in both YAML or JSON. 


## Swagger UI 

In order to view our newly created OpenAPI 2.0 specification that defines our Books API we can view the YAML file in Swagger UI. A free web browser based tool that translates our document into an interactive UI. 

For the purposes of the demo I have created an Express page to display the Swagger UI app via an npm install of the swagger-ui-express library. This is automatically made avaialble when you run the app with:

```bash
npm run start
```

To view the Swagger UI, open a web browser and navigating to: http://localhost:3000/api-docs. I have preconfigured this to point towards our ```books-openapi.yaml``` specification.

> Note: this is not usual practice and is just here for the purposes of this demo. Typically the URL of your teams Swagger UI instance will be shared with you and you have the ability to select the specification you wish to test via the 'Explore' search bar in the top of the Swagger UI home page. Speak to the developers in your team for info as to how they access Swagger-UI. Some teams also use a version within their IntelliJ IDE. 
