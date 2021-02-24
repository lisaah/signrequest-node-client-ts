/* tslint:disable */
/* eslint-disable */
/**
 * SignRequest API
 * API for SignRequest.com  # Getting Started  The SignRequest REST API enables you to send out signature requests. Using the API you will always have all the functionality as when using our User Interface, plus more.  When you\'re logged in and you have a Team enabled, you can also use the endpoints in your browser by visiting them. For example:  `https://<your_subdomain>.signrequest.com/api/v1/`  It is also possible to receive events from SignRequest when, for example, a document has been signed. This way you can keep your application in sync with SignRequest without polling document endpoints. For this a callback url needs to be provided in the [team API settings page](/#/teams).  ## Sandbox Team  The easiest way to get started is by creating a free [Sandbox Team](/#teams?sandbox=true). Sandbox teams allow you to test out the entire SignRequest product without incurring charges. Everything works the same as a paid plan, except that all documents will be watermarked.  ## API Token  In order to use the API you first need to obtain an API token. You can create an API token in the [team API settings page](/#/teams).   Use tokens with a `Authorization: Token YOUR_TOKEN_HERE` header in your requests when making requests to the SignRequest API.  cURL example:  ```bash curl -H \'Authorization: Token YOUR_TOKEN_HERE\' -H \'Content-Type: application/json\' ```  ## Creating a Document  In order to send out a SignRequest, we first need to create a document. There are three ways to create a document using the [documents endpoint](#operation/documents_create).  1) Sending a POST request that includes a `template` uuid, created via our User Interface. For example:   `https://<your_subdomain>.signrequest.com/api/v1/templates/uuid/`  2) By sending a `file_from_url`, which is a file publicly available in the cloud. This way, SignRequest will download the document from that location; therefore, make sure it is not a private link.  3) By providing a base64 encoded document, located in your local environment, using the parameter `file_from_content`. Together with the file name for this content, using the parameter `file_from_content_name`, for example:   ``` file_from_content: pdf_encoded_base64, file_from_content_name: \'demo_document.pdf\', name: \'demo_document.pdf\', ```  This can be useful if you need to send more than one file (nested, when using [signrequest-quick-create endpoint](#operation/signrequest-quick-create_create)) configuration data. Please be sure to add the correct extension to the filename (e.g. my_pdf_file.pdf) in order for SignRequest to be able to determine the content type of the content.  As mentioned above, when using `file_from_url`, this url needs to be publicly available for SignRequest to download. The download location may also be a Google Drive shareable link for documents (`application/vnd.google-apps.document`) and files (`application/vnd.google-apps.file`). If the download location returns a content type of `text/plain` or `text/html`, SignRequest will do its best to make a PDF out of it. This can be used if you want to dynamically create PDF documents from web pages without making a PDF yourself. An `external_id` is optional and can be used in order to have a reference to the document in your systems. The `name` field is also optional and can be customized, defaults to the filename (including extension).   ## Sending a SignRequest  Once you have successfully created a document, you can use the [signrequests endpoint](#operation/signrequests_create) to send a SignRequest using the `url` returned from the [documents endpoint](#operation/documents_create). For example:  `document: https://<your_subdomain>.signrequest.com/api/v1/documents/uuid/`  The minimal data needed to send out a SignRequest is the following:  ```json {     \"document\": \"https://signrequest.com/api/v1/documents/f2bac751-4fa1-43f1-91de-a1b8905c239a/\",      \"from_email\": \"you@yourcompany.com\",      \"message\": \"Please sign this document.\\n\\nThanks!\",      \"signers\": [         {             \"email\": \"tech-support@signrequest.com\"         }     ] } ```  Note that we always also create a signer for the `from_email` sending the SignRequest, however for this signer the `needs_to_sign` flag is set to `false` meaning that this signer will **not** get a SignRequest.  ## Quick Create a SignRequest  In some cases it might be desirable to create a document and send the SignRequest in one API call. This can be done using the [signrequest-quick-create endpoint](#tag/signrequest-quick-create). This endpoint takes all of the fields of the [documents](#operation/documents_create) and [signrequests](#operation/signrequests_create) endpoints together, creates the document, and sends the SignRequest.  ## Browsable API  In addition to our API docs, you can also explore our API endpoints using our [browsable API](/api/v1/). There you\'ll be able to browse our various endpoints and even perform requests against our live API.  # Working with a SignRequest  ## Add attachments to a SignRequest  Attachments can be added to a SignRequest using the [document-attachments endpoint](#operation/document-attachments_create). Signers will be able to download and read them before signing, but these will not be signed themselves. Document attachments can only be added when the SignRequest is not created yet.  Notice: This only works for documents created using the `file_from_url` and `file_from_content` methods. For documents created using a `template`, attachments should be added via our User Interface.    ## Customizing the SignRequest email  If the Team has a custom color and logo these will be used in the SignRequest email. The `subject` and `message` fields can also be used to customize the email even further. The `message` may contain the following html tags: `a`, `abbr`, `acronym`, `b`, `blockquote`, `code`, `em`, `i`, `ul`, `li`, `ol`, and `strong`. Be aware that when the text to html ratio is too high, the email may end up in spam filters. Custom styles on these tags are not allowed.  When the `from_email_name` field is provided, this name will be used in the `From` email header as such `{from_email_name} <no-reply@signrequest.com>`. By default `Sender Name (sender@email.com) | SignRequest` is used as the `from_email_name`. Note that it\'s currently not possible to change the email address used to send a SignRequest.  ## Resend the SignRequest email(s)  The [resend_signrequest_email](#operation/signrequests_resend_signrequest_email) endpoint can be used to resend the SignRequest email as a reminder to all signers who didn\'t sign yet but did receive the email before.  ## Cancel a SignRequest  A SignRequest that has not been fully signed or declined yet can be cancelled using the [cancel_signrequest endpoint](#operation/signrequests_cancel_signrequest). By doing so all signers that have not signed yet will not be able to open and sign the document anymore.   ## Download a signed document  When a SignRequest has been signed the `pdf` field on the document resource will be filled with a link to download the signed PDF. The signing log PDF can be downloaded from the `pdf` field contained within the `signing_log` object field on the document resource.  The recommended way to download the files and store them in your own systems is to setup the [Events callback](#section/Events/Events-callback) functionality and have your application download the files on the `signed` (Document signed) event. Please note that the download links expire and are regenerated on every API call / events callback so download the files right away when needed.  ## Deleting documents  To delete a document for the owner of the document, send a DELETE request to the [document resource url](#operation/documents_delete). Note that at this point this only makes the document unavailable for the sender. For all signers that do not have a registered SignRequest account, a grace period is started to give them a chance to download the signed document. After this grace period the document will be deleted for these signers automatically. When all signers have requested a delete (manually, automatically, or via the API) or do not have a registered SignRequest account and the grace period has lapsed, the document will be fully deleted.  ### Automatic document deletion  To automatically delete a document the `auto_delete_days` field on a document can be set to a number of days after which a finished document (signed/cancelled/declined) will be automatically deleted. The behavior is the same as doing a DELETE on the document resource url X number of days after the document is finished. When the document is scheduled to be deleted the `auto_delete_after` will hold the date after which it will be deleted.  Note that we can make exceptions (to delete documents right away and entirely) for integration partners when they make the document available in other systems and users do not use SignRequest directly. Please [contact us](https://signrequest.com/en/contact/) to request an app screening if this functionality is required.  ## Chaining multiple documents  When sending a SignRequest, it\'s possible to reference a document uuid (the same uuid used for the \'document\' parameter sent to /signrequests/) in the `after_document` field in the `signers\'` array. This should reference a document that the signer should be redirected to after signing. Since the signer is redirected to this document immediately after signing the other document, they do NOT get a SignRequest email. Note that resending the SignRequest email will trigger the SignRequest email even though they didn\'t receive one before.  When `after_document` references a document where the signer in question already has signed or declined they will still receive a SignRequest email as we cannot redirect them anymore. It\'s only possible to reference documents that are not fully signed (or declined) yet.  A `redirect_url` field is also available on a `signer` and on the `signrequest` (the default when not specified on the individual signers explicitly). When specified SignRequest will redirect to this url when a document is signed. Note that this only works when there are no chained documents for this signer anymore.  The `redirect_url_declined` field is available on `signer` and on `signrequest` for the case that a user declines the document  Despite the limitations, chaining also works on the [signrequest-quick-create endpoint](#operation/signrequest-quick-create_create). When creating a SignRequest on that endpoint, you get a reference to the created document in the `document` field back which can be used in the next call to `signrequest-quick-create` when creating a chain with `after_document`.  In general, to generate multi-docs via API, the best practice is to create documents and SignRequests separately. For example, to create a multi-doc containing three chained documents, it will be necessary to create three documents first (via POST /documents/) and then three SignRequests (via POST /signrequests/) for each one of those documents. Hence, a multi-doc SignRequest should be generated in reverse, from the last to the first document. With the last SignRequest containing only the first document\'s uuid and no `after_documents` included.  **Example flow - SignRequest containing 3 documents**  **SignRequest 3:** contains document 3 in `document` and document 2 in `after_document`. **SignRequest 2:** contains document 2 in `document` and document 1 in `after_document`. **SignRequest 1:** contains document 1 in `document`.  Thus, if a multi-doc contains a X number of documents, it will be necessary to create a X number of document uuids and the same X number of SignRequests.  `X Document uuids = X SignRequests`  ## Signer language  If known the language of the signer can be set in the `language` field. This will determine the language of the SignRequest email. The SignRequest browser interface language is by default set to the location, browser, or user account settings when available.  To force the language of the interface when a signer lands on the signing page the field `force_language` on the signer can be set to `true`. Note that if the language of the signer is not known it\'s best to not force the language.  Available languages:  `en` English   `en-gb` English (GB)   `nl` Dutch   `fr` French   `de` German   `he` Hebrew   `da` Danish   `fi` Finnish   `hu` Hungarian   `it` Italian   `no` Norwegian   `pl` Polish   `pt` Portuguese   `es` Spanish   `sv` Swedish   `ru` Russian   ## Text message and bank account verification  For a higher degree of authentication of your signers it is possible to enable text message phone number verification and bank account verification. These verifications can be enabled by providing the phone number to `verify_phone_number` (international format including the plus-sign) and/or the bank account to `verify_bank_account` on a signer. Currently it is only possible to verify bank accounts using [iDEAL](https://www.ideal.nl/en/).  When enabled, signers can only sign (finalize) a document when they have verified their phone number by a code supplied to them by a text message and/or make a payment of 1 cent. The verifications are logged and visible in the SignRequest signing log after completion.  Please note that we cannot force signers to make a payment using a specific bank account. Therefore the content of the field may also specify what type of account to use instead of a specific bank account number, e.g.: \"the bank account you want to use for paying the rent.\"  For this service additional fees apply. Please [contact us](https://signrequest.com/en/contact/) for a quote.  ## Disable signing tools/features  It is possible to disable certain tools/features signers have when signing a document. The following flags can be set to `true` on the signrequest model to disable these features.  - `disable_text`: disable adding of text - `disable_date`: disable adding of dates - `disable_attachments`: disable uploading/adding of attachments - `disable_text_signatures`: disable usage of signatures generated by typing (text) - `disable_upload_signatures`: disable usage of uploaded signatures (images)  Please note that we strongly **discourage you to disable features** as these are carefully chosen for optimal usability of the SignRequest product.  ## Required attachments  To require signers to upload attachments (like a passport for example) the `required_attachments` field can be used. The field takes an array of objects with one parameter `name`, for example: `required_attachments: [{\"name\": \"Passport\"}]`   ## Templates  In the frontend application it is possible to create templates. These templates, for Teams and Personal accounts, can be found in the [templates resource](#tag/templates). In order to send a SignRequest using a template, reference the resource url of the template in the `template` field. This works in both the [documents](#tag/documents) and the [signrequest-quick-create](#tag/signrequest-quick-create) resources.  ## Automatic reminders To enable automatic reminders set the `send_reminders` boolean to `true` on the [SignRequest resource](#tag/signrequests). When enabled SignRequest will automatically remind signers to sign a document on day 3, 8, 13 and 18 (or less if the document has been digitally signed already).  # Preparing a document  Using the SignRequest frontend web application you have the option to \"prepare\" a document. This helps the receiver as they can only sign the document at the designated place.  Using the API you can also **prepare a document by using tags** to specify where a signer needs to add a date, text, checkbox, and/or a signature.  Tags need to start with `[[` and end with `]]`. The tag data is separated by a pipe `|`. The first letter of the tag represents the tag type and must be one of the following:  - `t` for text - `d` for date - `s` for signature - `c` for checkbox  The second piece of data is an integer representing the index of the signer for which this placeholder is intended. The numbers in the tags are used to make distinctions between the signers and group multiple tags (input fields) to one specific signer.  The template tags are assigned to the order at which the email addresses are added to the contact field and are not the same as the order of signing. This means that for example `s|1` can be the first or last signer depending on what you specified in the order of signing (if used of course).  As the sender is always the first email address added, this means the sender is always `s|0`. If the sender does not need to add a signature or other data input, then `s|0` will be assigned to the next in line.  Mismatches in the amount of declared placeholders and available signers will be silently ignored. The extra placeholders will not show up if more than the amount of signers **OR** signers just get an unprepared document to sign when there were no placeholders declared for them.  Examples:  ``` [[s|0                 ]]  // A signature for the first signer OR the owner/sender when they need to sign. [[c|0                 ]]  // A checkbox placeholder for the first signer [[d|1                 ]]  // A date input placeholder for the second signer [[t|2                 ]]  // A text input placeholder for the third signer ```  The height / width (font size) and the position of the tag in your document matters. Also as you do not want the **placeholder tag to show up in the document** to avoid this you need to make the font color match the background. Sign this demo document for an example (the color is left gray to see the tags):  ```html https://signrequest.com/#/?api=v1&who=m&from_email=you@yourcompany.com&doc_url=https%3A%2F%2Fsignrequest.com%2Fstatic%2Fdemo%2FSignRequestTagsExample.pdf ```  Note that the font chosen can make a difference in the bounding box margins and position. For most fonts the top margin will be bigger as desired. For this reason make sure to **leave enough space or double the line height** in order for the placeholder to not overlap the line above.  ## Tag modifiers There are multiple tag modifiers available to further customize the tags. The following key / value pairs can be used after the signer index.  - `r` to make a placeholder required to be filled: `1` / `true` for required `0` / `false` for not required - `m` to make a text placeholder multiline: `1` / `true` for multiline `0` / `false` for single line (default) - `n` to set a label/name on a text placeholder: \'a string\' - `p` to prefill text/dates on a text/date placeholder: \'a string\', for a date placeholder this can also be set to `0` / `false` to not prefill the current date. - `id` to assign an `external_id` to the placeholder: \"your_id\" (also see [Retrieving signer input](#section/Preparing-a-document/Retrieving-signer-input) and [Prefill tags](#section/Preparing-a-document/Prefill-tags-templates))  Examples:  ``` [[c|0|r:1                                ]]  // A checkbox that cannot be skipped (needs to be checked or not) [[c|0|r:0                                ]]  // A checkbox that can be skipped [[c|0|p:1                                ]]  // A checkbox that is by default checked (can be changed) [[d|0|n:Birth date|p:0                   ]]  // A date that is not prefilled with the date of signing and has the label \'Birth date\' [[t|0|n:City|p:New York|id:customer_city ]]  // A text input placeholder with the label \'City\', prefilled with the text \'New York\' and an external_id of \'customer_city\' that will be available later in the \'inputs\' field (see: \'Retrieving signer input\') and can be used to prefill the tag using prefill_tags on the document resource (see: \'Prefill tags\'). ```  Note that placeholder names / prefilled data can get quite long. If this impacts the placeholder width/height you can choose to make the font between the opening `[[` and closing `]]` tags (really) small. The tag configuration does not need to be human readable as the text is extracted from the PDF format directly.  ## Prefill tags / templates  Instead of generating a new document and use the `p` tag modifier to prefill signer input data it is also possible to use `prefill_tags`. For this to work all tags need to have an `id` as this is needed to reference the tag.  Example:  ``` [[c|0|id:checkbox_1                      ]]  // Should be checked [[c|0|id:checkbox_2                      ]]  // Should not be checked [[d|0|n:Birth date|id:birth_date         ]]  // Should be prefilled with the birth date of the signer [[t|0|n:City|id:customer_city            ]]  // Should be prefilled with \'New York\' ```  Now when a document contains the tags above you can prefill them using the `prefill_tags` field on document by referencing the \'id\'. Note that tags are only prefilled, and thus visible, when the signer belonging to the prefilled tag opens the document. Only after a signer, with prefilled tags, has signed, those tags will also be visible to other signers opening the document. So for example, when the sender signer (index 0) has tags assigned (and prefilled using the api) and there is no particular order in which the signers sign (all at the same time), and the second signer opens the document the tags will not be visible. However, when the sender signer signs before the second signer opens the document the tags will be visible while signing.  ```json \"prefill_tags\": [     {\"external_id\":\"checkbox_1\", \"checkbox_value\":\"true\"},     {\"external_id\":\"checkbox_2\", \"checkbox_value\":\"false\"},     {\"external_id\":\"birth_date\", \"date_value\":\"1984-12-31\"},  // must be in ISO format ([YYYY]-[MM]-[DD])     {\"external_id\":\"customer_city\", \"text\":\"New York\"} ] ```  If you are using templates created from within the SignRequest app you can also set the `external_id` of a template tag in the advanced section when editing a tag.  Note that it\'s also possible to add these tags when using the <a href=\"#section/Frontend-API/SignRequest-js-client-(beta)\">SignRequest-js client</a> and the [Frontend API](#section/Frontend-API).  ## Prepare using the web interface  It is also possible to have the sender of a SignRequest prepare the document before sending the request out. To use this functionality, set the `is_being_prepared` flag on the SignRequest resource to `true`. When doing so the SignRequest will not be sent out to the recipient(s) and the `prepare_url` field will be set to a url where your application can redirect the sender to. Please note that if the sender does not have a SignRequest account they will be asked to verify their email after preparing the document. If you\'re an integration partner please [contact us](https://signrequest.com/en/contact/) for more possibilities when integrating this functionality.  Example:  ```json {     \"file_from_url\": \"https://signrequest.com/static/demo/SignRequestDemoDocument.pdf\",     \"from_email\": \"you@yourcompany.com\",     \"who\": \"mo\",     \"is_being_prepared\": \"true\",     \"signers\": [{\"email\": \"you@yourcompany.com\"}, {\"email\": \"tech-support@signrequest.com\"}] } ```  Note that it\'s perfectly fine to also include tags in the document. The sender will be able to change / remove them.  ## Retrieving signer input  All text, date, and boolean inputs of signers after a signer signs are available in the `inputs` field of a signer as text. This can be helpful if you need to update your systems based on data signers add to a document.  ```json \"inputs\": [     {         \"type\": \"d\",  // \'s\' (signature input), \'t\' (text input), \'d\' (date input) or \'c\' (checkbox input)         \"page_index\": 0,  // index of the page this input resides on         \"text\": \"09-25-18\",  // text as seen on the document (only for date and text inputs)         \"checkbox_value\": null,  // true or false (only for checkbox inputs)         \"date_value\": \"2018-09-25\",  // the date in ISO format ([YYYY]-[MM]-[DD])         \"external_id\": null  // optionally the external id assigned to a tag (helpful if you need to identify a specific input, also see \'Tag modifiers\')     } ] ```  ## Tags Example  Signer 0: this is the first person that needs to sign (including you).  ![Signer 0](https://signrequest.com/assets/images/blogs/template-tags-electronic-signature-0.bf35c985.png)  Signer 1: this is the second person that needs to sign (including you).  ![Signer 1](https://signrequest.com/assets/images/blogs/template-tags-electronic-signature-1.335ad0c8.png)  The result in SignRequest:  ![Result in SignRequest](https://signrequest.com/assets/images/blogs/tags-example.2bb33d7f.png)  ## Example Documents  You can quickly test this feature with our example documents:  1. [Basic example document](https://docs.google.com/document/d/1oI2R1SxfMNZXiz3jCQvorpoklF9xq_dCJnOpkI-zo80/edit?usp=sharing) 2. [Advanced example document](https://docs.google.com/document/d/1-gzqym9clQ1a193JGocXUeIX92cqPINBHOBeGxbDASw/edit)  These are shared Google Docs documents with example tags. If you have our Google Docs Add-on you can directly send a SignRequest!  If you don\'t have our Google Docs Add-on for electronic signatures, go to \"Add-ons\" in the Google Docs menu bar and install the Add-on for free. Then, go back to \"Add-ons\" and click \"SignRequest\".  ## Walkthrough Video  We also have a walkthrough video on YouTube about using templates with tags in a base document:  [![Templates with tags in a base document](https://img.youtube.com/vi/y5U5WqTqZBQ/0.jpg)](https://www.youtube.com/watch?v=y5U5WqTqZBQ)  # Events  ## Events callback  In order to receive the `events` as a callback to your application a **callback url** needs to be set in the [team API settings](/#/teams) page. When set, SignRequest will POST events as `application/json` to this endpoint. Your endpoint should return a 200 OK response. SignRequest will retry delivering events in the case of a timeout or a 500 response from your server. It first waits one minute and then increases on every subsequent attempt according to a Fibonacci sequence for a maximum of ten attempts (1, 1, 2, 3, 5, etc).  It is also possible to change the **callback url on a per document basis**. To use this functionality you can set the callback url using the `events_callback_url` field when [creating a document](#operation/documents_create) or when using the [signrequest-quick-create endpoint](#tag/signrequest-quick-create).  Please be aware that we might add more event types in the future so code defensively for that.  For an example of how an event receiver can be written checkout this [repository](https://github.com/SignRequest/signrequest-event-receiver).  The following event types are available:  - `convert_error`: Document convert error   - `converted`: Document converted   - `sending_error`: Document sending error   - `sent`: Document sent   - `declined`: Document declined   - `cancelled`: Document cancelled   - `expired`: Document expired   - `signed`: Document signed   - `signer_signed`: Signer signed   - `signer_email_bounced`: Signer email bounced   - `signer_viewed_email`: Signer viewed email   - `signer_viewed`: Signer viewed document   - `signer_forwarded`: Signer forwarded document   - `signer_downloaded`: Signer downloaded   - `signrequest_received`: SignRequest received    Status codes:  - `ok`: ok - `error`: error  The event status will be `error` for the following events: `convert_error`, `sending_error`, and `signer_email_bounced`.  The document status field can have the following codes:  - `co`: converting - `ne`: new - `se`: sent - `vi`: viewed - `si`: signed - `do`: downloaded - `sd`: signed and downloaded - `ca`: cancelled - `xp`: expired - `de`: declined - `ec`: error converting - `es`: error sending  Example callback request:  ```json {     \"document\": {         \"api_used\": true,          \"attachments\": [],          \"external_id\": \"your_id_of_this_document\",          \"file\": \"signrequest download url of the uploaded file\",          \"file_from_url\": \"url where signrequest downloaded the document, if this functionality was used\",          \"name\": \"document.pdf\",          \"pdf\": null,          \"prefill_tags\": [],          \"security_hash\": null,          \"signing_log\": null,          \"signrequest\": null,          \"status\": \"co\",          \"team\": {             \"name\": \"the_name_of_your_team\",              \"subdomain\": \"the_subdomain_of_your_team\"         },          \"template\": null,          \"url\": \"https://signrequest.com/api/v1/documents/f2bac751-4fa1-43f1-91de-a1b8905c239a/\",          \"user\": null,          \"uuid\": \"f2bac751-4fa1-43f1-91de-a1b8905c239a\"     },      \"event_hash\": \"89365cda10349ced9c3fd9c457372b37ad2e723c5b9f11a4d0b2c16724d8a2e7\",      \"event_time\": \"1537889008\",      \"event_type\": \"converted\",      \"signer\": null,      \"status\": \"ok\",      \"team\": {         \"name\": \"the_name_of_your_team\",          \"subdomain\": \"the_subdomain_of_your_team\"     },      \"timestamp\": \"2018-09-25T15:23:28.836457Z\",      \"token_name\": \"Token\",      \"uuid\": \"ffffd4dd-89c7-4133-ba2d-960f65c8d395\" } ```  If the event is **signer related** the `signer` field will contain all the signer data.  All event data can also be fetched using the REST API [Events resource](#tag/events). Be sure to check that out if you\'re developing your endpoint and see how the data looks.  You can check the authenticity (that the event really came from SignRequest) by generating and comparing the `event_hash` that comes with the event. The `event_hash` is generated with the HMAC algorithm using your API Token as a key in SHA256 digest mode.  OpenSSL shell example:  ```bash echo -n \"${event_time}${event_type}\" | openssl dgst -sha256 -hmac \"YOUR_TOKEN_HERE\" ```  which expands to:  ```bash echo -n \"1537889008converted\" | openssl dgst -sha256 -hmac \"YOUR_TOKEN_HERE\" 675ceef2ce146de8ba8d24ac878cdd1a0f5868b37dfe9e30699387eb18e17977 ```  If you have multiple API tokens created you can identify the used token by the `token_name` (if you provided one).  Always use **SSL enabled endpoints**!  Developing your callback endpoint locally? Checkout [UltraHook](http://www.ultrahook.com/) to receive webhooks on localhost, nifty!  For an example of an Events Receiver using Node.js, check the following repository (using Ngrok: https://ngrok.com/docs): https://github.com/SignRequest/SignRequest-events-receiver-Nodejs  ## Event webhooks  To receive only specific event callbacks, webhook subscriptions can be created for Teams and for Personal accounts. The resource takes an `event_type`, `callback_url` and optionally a `name` to easily identify what webhook is used for. The `integration` field can also be set when this hook is specific to one of the SignRequest supported integrations. Check out the [webhooks resource](#tag/webhooks) for all possible event types to subscribe to. When the webhooks are used on personal accounts these webhooks also receive the `signrequest_received` event which can be used to notify users that they have received a new SignRequest. However, creating webhook subscriptions for personal accounts requires a SignRequest session (logged in user) or Basic auth using a username and password.  ## Disable all SignRequest email events  It is possible to disable all SignRequest status emails as well as the email that contains the signed documents. When using this functionality the following events will not generate a SignRequest email:  - `sent`: Document sent - `signer_email_bounced`: Signer email bounced - `signer_viewed_email`: Signer viewed email - `signer_viewed`: Signer viewed document - `signer_signed`: Signer signed - `signed`: Document signed - `declined`: Document declined - `cancelled`: Document cancelled  To enable this feature set the `disable_emails` flag on the [SignRequest resource](#tag/signrequests) to true.   Note that the event emails will only be disabled if there is `callback_url` available for the document as your application is expected to notify users instead of SignRequest. The initial SignRequest email (that contains the link to sign) can only be disabled by using the [Embed url](#section/Additional-signing-methods/Embed-url) functionality.  # Frontend API  Another option to help your users sending SignRequests is using the \"frontend\" api. This involves no token and is merely used to \"prefill\" the SignRequest box found at the homepage for your users. The only requirement is that the document to send out is publicly available in order for SignRequest to download the file. Shareable links of Google Drive documents are also supported here.  GET params for prefilling the box:  ``` api=v1  // the version of the API to use who=mo  // mo=\'me & others\', m=\'only me\', o=\'only others\' signers=first_email@example.com,second_email@example.com  // emails of \'signers\' comma separated from_email=you@yourcompany.com  // email of the person sending the SignRequest doc_url=https%3A%2F%2Fsignrequest.com%2Fstatic%2Fdemo%2FSignRequestDemoDocument.pdf  // the url where SignRequest can download the document (quoted) ```  Example resulting url:  ``` https://signrequest.com/#/?api=v1&who=mo&signers=tech-support@signrequest.com&from_email=you@yourcompany.com&doc_url=https%3A%2F%2Fsignrequest.com%2Fstatic%2Fdemo%2FSignRequestDemoDocument.pdf ```  Note that you can also use prefill tags here by adding the parameter prefill_tags. The value should be Base64 encoded JSON, JavaScript example:  ```javascript btoa(JSON.stringify([{external_id: \'customer_city\', text: \'New York\'}])); // the output can be used with the parameter: // prefill_tags=W3siZXh0ZXJuYWxfaWQiOiJjdXN0b21lcl9jaXR5IiwidGV4dCI6Ik5ldyBZb3JrIn1d ```  ## SignRequest-js client  Although we consider the library \"beta\" you can count on a stable API (semver). However, if you plan to use this please [contact us](https://signrequest.com/en/contact/) so we know your use case and can help you out where needed. We will open up the repository to the public when out of beta.  To use the SignRequest javascript library include the following in your page (npm and bower are coming when out of beta):  ```html <script src=\"https://cdn.signrequest.com/signrequest-js/v1/signrequest-js.min.js\"></script> ``` Or for async loading use:  ```html <script> !function(t,e,n,i){var s=function(e,n){t.SignRequest&&t.SignRequest.loaded||setTimeout(function(){t.SignRequest.init(e,n)},50)};t.SignRequest=t.SignRequest||{loaded:0,init:s};var o=\"https:\"==e.location.protocol?\"https://\":\"http://\",u=e.createElement(\"script\");u.async=!0;var c=e.scripts[0];u.src=o+\"cdn.signrequest.com/signrequest-js/v1/signrequest-js.min.js\",c.parentNode.insertBefore(u,c),t.SignRequest.init(n,i)}(window,document,{   // this initial configuration is optional, may also be undefined   subdomain: \'\'  // you could for example initialize the library to use a specific team subdomain here }, function (SignRequest) {   // this callback is optional, may also be undefined   // SignRequest library is loaded and also passed as first argument   // execute your code... }); </script> ```  The library uses [UMD](https://github.com/umdjs/umd) (Universal Module Definition).  To use a specific version (current is **1.0.5**) use for example: **cdn.signrequest.com/signrequest-js/v1/1.0.5/signrequest-js.min.js**.  ### Usage  ```javascript // same as the frontend API GET parameters, these are all optional var conf = {     subdomain: \'\', // if you are using this for a specific team set the subdomain here     api: \'v1\',     who: \'mo\',     signers: \'first_email@example.com,second_email@example.com\',     from_email: \'you@yourcompany.com\',     close: true,  // close the popup when done? default: true     // or use next:     next: \'\',  // redirect to this url when done signing themselves,     frontend_id: \'\' // optional shared secret set on document to grant access to users even if they don\'t have access to team } // these are also optional, the popup will be centered in the window opening the popup var popup_conf = {     width: 460,  // width of the popup in pixels, default 460     height: 600, // height of the popup in pixels, default the height of the window opening the popup }  // to open a specific document first create a document using the REST API with your backend // be sure to also set the correct \'subdomain\' in the configuration when you create a document for a specific team var doc_uuid = \'the-uuid-of-the-document\'; SignRequest.browser.openPopupForDocUuid(doc_uuid, conf, popup_conf);  // to create a document from a url var doc_url = \'https://signrequest.com/static/demo/SignRequestDemoDocument.pdf\' SignRequest.browser.openPopupForDocUrl(doc_url, conf, popup_conf);  // to create a document from a template uuid var template_uuid = \'the-uuid-of-the-template\' SignRequest.browser.openPopupForTemplateUuid(template_uuid, conf, popup_conf);  // to open a popup using custom params var popup = SignRequest.browser.openPopup(conf, popup_conf);  // if your document contains template tags / placeholders that have an \'external_id\' // it is possible to \'prefill\' these for a particular SignRequest by updating your conf object with for example: conf.prefill_tags = [{external_id: \'customer_city\', text: \'New York\'}]; // Now all template tags with this external_id will be prefilled with \'New York\'  // all popup openers return an instance of the popup to which event callbacks can be registered (they can be chained) // the possible events are: \'opened\', \'sent\', \'signed\', \'declined\', \'finished\', \'closed\', \'any\' // note that \'sent\', \'finished\' and \'closed\' can be called fast after each other when the popup autocloses (close: true) // also when sending a SignRequest and the sender also need to sign you can receive the \'signed\' or \'declined\' event // after the \'sent\' event (SignRequest created). // When the sender is done (sending and possibly siging) the \'finished\' event is fired. popup = popup.on(\'closed\', function (event_type, payload, event) {     // this would fire when the popup closes, you might want to update your page based on events like this     console.log(event_type, payload, event); })  // shortcut to fire on all events (\'any\') popup.onAny(function (event_type, payload, event) {     // this would fire on all events     console.log(event_type, payload, event); })  // to set a default configuration to use in all future calls for example for a team subdomain SignRequest.browser.setConfig({subdomain: \'the_subdomain_of_your_team\'});  // When creating a document for your users using our REST API and open that document in the popup in response to clicking a button // you might need to open the popup before you know the uuid of the document from your backend. // This to prevent popup blockers from kicking in when doing async work before we open a popup. // For this use case you can use the `openLoadingPopup` helper on click and use that already opened popup to load a document later.  $(\'button#your_button\').on(\'click\', function () {  // using jQuery in the following example (not required for signrequest-js)     var popup = SignRequest.browser.openLoadingPopup();  // open a popup on button click right away     popup.onAny(function (event_type, payload, event) {         // all listeners created on the loading popup will also be registered on the popup events fired later after the we call         // SignRequest.browser.openPopupForDocUuid...         console.log(\'Event received: \' + event_type + \', payload: \' + JSON.stringify(payload);     });     // Async call some endpoint on your backend that creates a document using the REST API.     $.post(\'/your-endpoint-to-create-a-document\', {some: \'data\'}).then(function(response){         // instead of opening a new popup we use the one that is \'loading\' as otherwise         // most browser popup blockers will block opening a new window here (the opening of the window comes too late after the user click).         // we assume here your endpoint returns the uuid of the document created in the response         SignRequest.browser.openPopupForDocUuid(response.document_uuid, conf, {sr_popup: popup});         // `{sr_popup: popup}` make the library use an existing popup instead of creating a new one     }); });  SignRequest.browser.openPopupForDocUrl(\'https://signrequest.com/static/demo/SignRequestDemoDocument.pdf\'); ```  ### Sharing document with external users  Normally a document stored within SignRequest would require the recipient to be a member of the document owner\'s team in order to gain access to the document. If you\'d like to share a document outside of your team, you can [create a document](#operation/documents_create) while storing a shared secret on the `frontend_id` field. Then, using the SingRequest-js Client, you can add the `frontend_id` to the `conf` object when calling `openPopupForDocUuid` in order to grant any user presented with the signing popup access to the document.  # Additional signing methods  ## Embed url  Normally SignRequest will send the SignRequest email to signers containing the personal link to sign a document. This is how SignRequest validates an email address and is the preferred way. However, if your application requires a continuous flow (in a sales flow for example) it is possible to generate an `embed_url` and redirect a signer to that link. Combined with a `redirect_url` and/or `redirect_url_declined` a continuous flow can be achieved.  Doing this moves the responsibility of identifying an email address / user to your application. This also shows in the signing log as SignRequest cannot guarantee that a document is signed by someone having access to an email address.  To generate the `embed_url` you need to declare the ID of the logged in user in YOUR application in the `embed_url_user_id` field. This ID will also show in the signing log.  Here\'s a simple example:  ```json {     \"file_from_url\": \"https://signrequest.com/static/demo/SignRequestDemoDocument.pdf\",     \"from_email\": \"you@yourcompany.com\",     \"who\": \"mo\",     \"signers\": [         {            \"email\": \"you@yourcompany.com\",            \"order\": 1,            \"embed_url_user_id\": \"YOUR ID\"         }     ] } ```  The generated `embed_url` can only be used until the document is signed. Note that it is perfectly fine to combine signers with and without a generated `embed_url`. The `order` field also behaves as you would expect. For example, if the first signer (order = 0) has an `embed_url` generated and the second (order = 1) not, the second signer will only receive the SignRequest email when the first one has signed.  When using this `embed_url` in an `iframe`, you can add any of the following url parameters to hide some elements in the header: `&hide_login=1` (hide the login button), `&hide_cancel=1` (hide the cancel link), `&hide_decline=1` (hide the option to decline), `&hide_logo=1` (hide the logo) and `&hide_title=1` (hide the document title in the header). Be aware that the `embed_url` may already contain other url parameters. Also note that hiding the login button does not disable to login prompt for signers that already have a SignRequest account. This cannot be disabled.  If you also want to disable all other SignRequest emails, see [Disable all SignRequest email events](#section/Events/Disable-all-SignRequest-email-events).  ## In person signing  In some cases your application might want to generate one url for both the sender of the document and the receiver to sign a document after each other in person.  This can be achieved by this signer configuration example:  ```json {     \"file_from_url\": \"https://signrequest.com/static/demo/SignRequestDemoDocument.pdf\",     \"from_email\": \"you@yourcompany.com\",     \"who\": \"mo\",     \"signers\": [         {            \"email\": \"you@yourcompany.com\",            \"order\": 1,            \"embed_url_user_id\": \"your ID\",         },         {             \"email\": \"tech-support@signrequest.com\",             \"order\": 2,             \"in_person\": true         }     ] } ```  This way you can redirect the user to the `embed_url` of the sender. After the sender has signed they will be redirected to the next `in_person` signer.  ## Approve only If you have contacts that you don\'t need a signature from, but want their approval, you can use the `approve_only` option for the signer.  In this case SignRequest will add this approval to the signing log, but it will be easier for the user / signer to quickly approve the document. It also has the added benefit that there will not be a visible signature on the document of that person.  ## Notify only If you have contacts that  do not need to take any action on the document, you can use the `notify_only` option for the signer.  The contact will receive an email during every step of this SignRequest.  He or she will receive an email when the document is first sent, when it is viewed, when it is signed by a signer, and finalized completely.  This contact will also receive a copy of the final document and signing log as attachments to the \"document signed\" email at the end.  ## Copy only If you have contacts that only need to receive a copy of the document, but does not need to sign, you can set `needs_to_sign` to `false` for the signer. This contact will simply receive a copy of the final document and signing log as attachments to the \"document signed\" email at the end.  # Integration Partners  ## Salesforce  The most straight forward way to integrate Salesforce with SignRequest is to use our managed package.  Normally you would use the SignRequest buttons provided in the managed package to create SignRequest documents from Salesforce but if you want to skip that step and create SignRequests using the API (but still sync documents to Salesforce) you can add the following data to a `signrequest`:  ```json \"integration_data\": {     \"object_type\": \"API NAME OF THE (S)OBJECT, e.g. \'Opportunity\' or \'CustomObject__c\'\",     \"uid\": \"UID OF THE SALESFORCE USER (NOT UUID), e.g. \'https:\\/\\/login.salesforce.com\\/id\\/00D24000000pMDZEA2\\/005240000048zB0AAI\'\",     \"object_id\": \"OBJECT ID, e.g. 0062400000MaeNv\" }, \"integration\": \"salesforce\" ```  Caveat: The user of the `from_email` needs to be a member of the Team that created the `signrequest`, and the user needs to have a SignRequest account using Salesforce OAuth.  ## Zapier  Does your app integrate with Zapier? Chances are your digital signatures are just a few clicks away!  Checkout our Zapier integration here: https://signrequest.com/en/digital-electronic-signatures-with-zapier/  ## Becoming an integration partner  If your application requires to create Teams and act on behalf of them you need to become an integration partner. This only grants you access to resources created by your application of the third party Team.  Teams can be created and updated on the [Teams resource](#tag/teams).  Please [contact us](https://signrequest.com/en/contact/) to learn more.  ## OAuth2 Authorization Framework  SignRequest allows partner applications to use the API on behalf of SignRequest users using OAuth2. If you need this functionality you can [create an application here](/api/v1/oauth2/applications/) (choose Client type: Confidential, Authorization grant type: Authorization code) and [contact us](https://signrequest.com/en/contact/) if you need any help. The OAuth2 framework is [rfc-compliant](https://tools.ietf.org/html/rfc6749).  OAuth2 endpoints:  - https://signrequest.com/api/v1/oauth2/authorize/ Get authorization code   GET params: client_id, scope(s)[=we currently only support the \'read\', \'write\' scopes], response_type[=code], state[=your_random_state_string], redirect_uri[=if not provided the first of your application is used] - https://signrequest.com/api/v1/oauth2/token/ Request a new (refresh) token   POST params: code[=the client code], grant_type[=authorization_code], redirect_uri, client_id, client_secret[=required when using the \'confidential\' client type] - https://signrequest.com/api/v1/oauth2/revoke_token/ Revoke a token   POST params: token[=token to revoke], token_type_hint[=optional, designating either \'access_token\' or \'refresh_token\'.  Use tokens with the `Authorization: Bearer YOUR_TOKEN_HERE` header in your requests. To remove your authorized applications/tokens during development [go here](/api/v1/oauth2/authorized_tokens/). [Contact us](https://signrequest.com/en/contact/) if you want your logo added to the consent screen.   # Client libraries  We have client libraries for the following languages. Is your language missing? Let us know!  - Python: https://github.com/SignRequest/signrequest-python-client   - Ruby: https://github.com/SignRequest/signrequest-ruby-client - Node.js (Javascript):  https://github.com/SignRequest/signrequest-node-client - C# (.NET): https://github.com/SignRequest/signrequest-csharp-client - PHP: https://github.com/SignRequest/signrequest-php-client - Event receiver (Python server): https://github.com/SignRequest/signrequest-event-receiver    We also offer two example repositories using Node.js and Python:  - Node Example: https://github.com/SignRequest/signrequest-Node-example - Python Example: https://github.com/SignRequest/signrequest-Python-example  ### More coming soon Documentation about more advanced usage of the SignRequest API and language specific client libraries is coming soon.  Feel free to contact us at tech-support@signrequest.com for any questions or feature requests. 
 *
 * The version of the OpenAPI document: v1
 * Contact: tech-support@signrequest.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import { Configuration } from './configuration';
import globalAxios, { AxiosPromise, AxiosInstance } from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from './common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from './base';

/**
 * 
 * @export
 * @interface AuditEvent
 */
export interface AuditEvent {
    /**
     * 
     * @type {string}
     * @memberof AuditEvent
     */
    domain?: string;
    /**
     * 
     * @type {string}
     * @memberof AuditEvent
     */
    user_uuid?: string;
    /**
     * 
     * @type {string}
     * @memberof AuditEvent
     */
    user_email?: string;
    /**
     * 
     * @type {string}
     * @memberof AuditEvent
     */
    user_ip?: string;
    /**
     * 
     * @type {string}
     * @memberof AuditEvent
     */
    event_type?: string;
    /**
     * 
     * @type {string}
     * @memberof AuditEvent
     */
    status?: string;
    /**
     * 
     * @type {string}
     * @memberof AuditEvent
     */
    timestamp?: string;
}
/**
 * 
 * @export
 * @interface AuthToken
 */
export interface AuthToken {
    /**
     * 
     * @type {string}
     * @memberof AuthToken
     */
    email?: string;
    /**
     * 
     * @type {string}
     * @memberof AuthToken
     */
    password?: string;
    /**
     * 
     * @type {string}
     * @memberof AuthToken
     */
    subdomain: string;
    /**
     * 
     * @type {string}
     * @memberof AuthToken
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof AuthToken
     */
    key?: string;
    /**
     * 
     * @type {string}
     * @memberof AuthToken
     */
    url?: string;
}
/**
 * 
 * @export
 * @interface Document
 */
export interface Document {
    /**
     * 
     * @type {string}
     * @memberof Document
     */
    url?: string;
    /**
     * 
     * @type {DocumentTeam}
     * @memberof Document
     */
    team?: DocumentTeam;
    /**
     * 
     * @type {string}
     * @memberof Document
     */
    uuid?: string;
    /**
     * 
     * @type {User}
     * @memberof Document
     */
    user?: User;
    /**
     * Temporary URL to original file as PDF, expires in five minutes
     * @type {string}
     * @memberof Document
     */
    file_as_pdf?: string;
    /**
     * Defaults to filename, including extension
     * @type {string}
     * @memberof Document
     */
    name?: string | null;
    /**
     * ID used to reference document in external system
     * @type {string}
     * @memberof Document
     */
    external_id?: string | null;
    /**
     * Shared secret used in conjunction with <a href=\"#section/Frontend-API/SignRequest-js-client-(beta)\">SignRequest-js client</a> to grant user access to a document that\'s not a member of the document\'s team
     * @type {string}
     * @memberof Document
     */
    frontend_id?: string | null;
    /**
     * Temporary URL to original file, expires in five minutes
     * @type {string}
     * @memberof Document
     */
    file?: string | null;
    /**
     * Publicly accessible URL of document to be downloaded by SignRequest
     * @type {string}
     * @memberof Document
     */
    file_from_url?: string | null;
    /**
     * URL at which to receive [event callbacks](#section/Events/Events-callback) for this document
     * @type {string}
     * @memberof Document
     */
    events_callback_url?: string | null;
    /**
     * Base64 encoded document content
     * @type {string}
     * @memberof Document
     */
    file_from_content?: string | null;
    /**
     * Filename, including extension. Required when using `file_from_content`.
     * @type {string}
     * @memberof Document
     */
    file_from_content_name?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Document
     */
    template?: string | null;
    /**
     * Prefill signer input data, see [prefill tags](#section/Preparing-a-document/Prefill-tags-templates)
     * @type {Array<InlinePrefillTags>}
     * @memberof Document
     */
    prefill_tags?: Array<InlinePrefillTags>;
    /**
     * 
     * @type {Array<InlineIntegrationData>}
     * @memberof Document
     */
    integrations?: Array<InlineIntegrationData>;
    /**
     * 
     * @type {FileFromSf}
     * @memberof Document
     */
    file_from_sf?: FileFromSf | null;
    /**
     * Number of days after which a finished document (signed/cancelled/declined) will be automatically deleted
     * @type {number}
     * @memberof Document
     */
    auto_delete_days?: number | null;
    /**
     * Number of days after which a non finished document will be automatically expired
     * @type {number}
     * @memberof Document
     */
    auto_expire_days?: number | null;
    /**
     * Temporary URL to signed document as PDF, expires in five minutes
     * @type {string}
     * @memberof Document
     */
    pdf?: string;
    /**
     * `co`: converting, `ne`: new, `se`: sent, `vi`: viewed, `si`: signed, `do`: downloaded, `sd`: signed and downloaded, `ca`: cancelled, `de`: declined, `ec`: error converting, `es`: error sending, `xp`: expired
     * @type {string}
     * @memberof Document
     */
    status?: DocumentStatusEnum;
    /**
     * 
     * @type {DocumentSignrequest}
     * @memberof Document
     */
    signrequest?: DocumentSignrequest;
    /**
     * Indicates whether document was created using the API
     * @type {boolean}
     * @memberof Document
     */
    api_used?: boolean;
    /**
     * 
     * @type {DocumentSigningLog}
     * @memberof Document
     */
    signing_log?: DocumentSigningLog;
    /**
     * SHA256 hash of PDF contents
     * @type {string}
     * @memberof Document
     */
    security_hash?: string;
    /**
     * 
     * @type {Array<DocumentAttachment>}
     * @memberof Document
     */
    attachments?: Array<DocumentAttachment>;
    /**
     * Date and time calculated using `auto_delete_days` after which a finished document (signed/cancelled/declined) will be automatically deleted
     * @type {string}
     * @memberof Document
     */
    auto_delete_after?: string;
    /**
     * Indicates whether document was created as part of a sandbox team
     * @type {boolean}
     * @memberof Document
     */
    sandbox?: boolean;
    /**
     * Date and time calculated using `auto_expire_days` after which a non finished document will be automatically expired
     * @type {string}
     * @memberof Document
     */
    auto_expire_after?: string;
    /**
     * Indicates whether a change to the document is processing and the PDF may be out of date. It is recommended to wait until processing has finished before downloading the PDF. Webhooks are not sent until processing has been completed.
     * @type {boolean}
     * @memberof Document
     */
    processing?: boolean;
}

/**
    * @export
    * @enum {string}
    */
export enum DocumentStatusEnum {
    Co = 'co',
    Ne = 'ne',
    Se = 'se',
    Vi = 'vi',
    Si = 'si',
    Do = 'do',
    Sd = 'sd',
    Ca = 'ca',
    De = 'de',
    Ec = 'ec',
    Es = 'es',
    Xp = 'xp'
}

/**
 * 
 * @export
 * @interface DocumentAttachment
 */
export interface DocumentAttachment {
    /**
     * 
     * @type {string}
     * @memberof DocumentAttachment
     */
    url?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentAttachment
     */
    uuid?: string;
    /**
     * Defaults to filename, including extension
     * @type {string}
     * @memberof DocumentAttachment
     */
    name?: string | null;
    /**
     * Temporary URL to document attachment, expires in five minutes
     * @type {string}
     * @memberof DocumentAttachment
     */
    file?: string | null;
    /**
     * Base64 encoded document content
     * @type {string}
     * @memberof DocumentAttachment
     */
    file_from_content?: string | null;
    /**
     * Filename, including extension. Required when using `file_from_content`.
     * @type {string}
     * @memberof DocumentAttachment
     */
    file_from_content_name?: string | null;
    /**
     * Publicly accessible URL of document to be downloaded by SignRequest
     * @type {string}
     * @memberof DocumentAttachment
     */
    file_from_url?: string | null;
    /**
     * 
     * @type {string}
     * @memberof DocumentAttachment
     */
    document: string;
}
/**
 * 
 * @export
 * @interface DocumentSearchDirect
 */
export interface DocumentSearchDirect {
    /**
     * 
     * @type {string}
     * @memberof DocumentSearchDirect
     */
    from_email?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSearchDirect
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSearchDirect
     */
    uuid?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSearchDirect
     */
    who?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSearchDirect
     */
    status?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSearchDirect
     */
    created?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSearchDirect
     */
    autocomplete?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSearchDirect
     */
    nr_extra_docs?: string;
    /**
     * 
     * @type {Array<ExtraDocument>}
     * @memberof DocumentSearchDirect
     */
    extra_docs?: Array<ExtraDocument>;
    /**
     * 
     * @type {Array<string>}
     * @memberof DocumentSearchDirect
     */
    signer_emails?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof DocumentSearchDirect
     */
    status_display?: string;
    /**
     * 
     * @type {number}
     * @memberof DocumentSearchDirect
     */
    created_timestamp?: number;
    /**
     * 
     * @type {number}
     * @memberof DocumentSearchDirect
     */
    finished_on_timestamp?: number;
    /**
     * 
     * @type {string}
     * @memberof DocumentSearchDirect
     */
    parent_doc?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSearchDirect
     */
    finished_on?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSearchDirect
     */
    subdomain?: string;
    /**
     * 
     * @type {boolean}
     * @memberof DocumentSearchDirect
     */
    processing?: boolean;
}
/**
 * 
 * @export
 * @interface DocumentSignerTemplateConf
 */
export interface DocumentSignerTemplateConf {
    /**
     * 
     * @type {number}
     * @memberof DocumentSignerTemplateConf
     */
    signer_index?: number;
    /**
     * When `false` user does not need to sign, but will receive a copy of the signed document and signing log, see: [Copy only](#section/Additional-signing-methods/Copy-only)
     * @type {boolean}
     * @memberof DocumentSignerTemplateConf
     */
    needs_to_sign?: boolean;
    /**
     * Require user to approve the document (without adding a signature), see: [Approve only](#section/Additional-signing-methods/Approve-only)
     * @type {boolean}
     * @memberof DocumentSignerTemplateConf
     */
    approve_only?: boolean;
    /**
     * Send notifications about the document and a copy of the signed document and signing log, but don\'t require them to take any action, see: [Notify only](#section/Additional-signing-methods/Notify-only)
     * @type {boolean}
     * @memberof DocumentSignerTemplateConf
     */
    notify_only?: boolean;
    /**
     * When used in combination with an embed url on the sender, after sender has signed, they will be redirected to the next `in_person` signer, see: [In person signing](#section/Additional-signing-methods/In-person-signing)
     * @type {boolean}
     * @memberof DocumentSignerTemplateConf
     */
    in_person?: boolean;
    /**
     * 
     * @type {number}
     * @memberof DocumentSignerTemplateConf
     */
    order?: number;
    /**
     * 
     * @type {Array<Placeholder>}
     * @memberof DocumentSignerTemplateConf
     */
    placeholders?: Array<Placeholder>;
}
/**
 * 
 * @export
 * @interface DocumentSigningLog
 */
export interface DocumentSigningLog {
    /**
     * Temporary URL to signing log, expires in five minutes
     * @type {string}
     * @memberof DocumentSigningLog
     */
    pdf?: string | null;
    /**
     * SHA256 hash of PDF contents
     * @type {string}
     * @memberof DocumentSigningLog
     */
    security_hash?: string;
}
/**
 * 
 * @export
 * @interface DocumentSignrequest
 */
export interface DocumentSignrequest {
    /**
     * Email of user sending the SignRequest (must be a validated email)
     * @type {string}
     * @memberof DocumentSignrequest
     */
    from_email?: string;
    /**
     * Name to be used in the `From` email header, e.g. `{from_email_name} <no-reply@signrequest.com>`
     * @type {string}
     * @memberof DocumentSignrequest
     */
    from_email_name?: string;
    /**
     * Have the sender of a SignRequest prepare the document before sending the request out, see: [prepare using the web interface](#section/Preparing-a-document/Prepare-using-the-web-interface)
     * @type {boolean}
     * @memberof DocumentSignrequest
     */
    is_being_prepared?: boolean;
    /**
     * 
     * @type {string}
     * @memberof DocumentSignrequest
     */
    prepare_url?: string;
    /**
     * URL at which SignRequest will redirect to when a document is signed
     * @type {string}
     * @memberof DocumentSignrequest
     */
    redirect_url?: string;
    /**
     * URL at which SignRequest will redirect to when a document is declined
     * @type {string}
     * @memberof DocumentSignrequest
     */
    redirect_url_declined?: string;
    /**
     * 
     * @type {Array<RequiredAttachment>}
     * @memberof DocumentSignrequest
     */
    required_attachments?: Array<RequiredAttachment>;
    /**
     * Disable uploading/adding of attachments
     * @type {boolean}
     * @memberof DocumentSignrequest
     */
    disable_attachments?: boolean;
    /**
     * Disable usage of signatures generated by typing (text)
     * @type {boolean}
     * @memberof DocumentSignrequest
     */
    disable_text_signatures?: boolean;
    /**
     * Disable adding of text
     * @type {boolean}
     * @memberof DocumentSignrequest
     */
    disable_text?: boolean;
    /**
     * Disable adding of dates
     * @type {boolean}
     * @memberof DocumentSignrequest
     */
    disable_date?: boolean;
    /**
     * Disable all SignRequest status emails as well as the email that contains the signed documents
     * @type {boolean}
     * @memberof DocumentSignrequest
     */
    disable_emails?: boolean;
    /**
     * Disable usage of uploaded signatures (images)
     * @type {boolean}
     * @memberof DocumentSignrequest
     */
    disable_upload_signatures?: boolean;
    /**
     * Force specific color for the signature
     * @type {string}
     * @memberof DocumentSignrequest
     */
    force_signature_color?: string;
    /**
     * Disables storing timestamp proof hashes in blockchain integrations.
     * @type {boolean}
     * @memberof DocumentSignrequest
     */
    disable_blockchain_proof?: boolean;
    /**
     * When true a text message verification is needed before the signer can see the document
     * @type {boolean}
     * @memberof DocumentSignrequest
     */
    text_message_verification_locked?: boolean;
    /**
     * Subject of SignRequest email
     * @type {string}
     * @memberof DocumentSignrequest
     */
    subject?: string;
    /**
     * Message to include in SignRequest email, may contain the following html tags: `a`, `abbr`, `acronym`, `b`, `blockquote`, `code`, `em`, `i`, `ul`, `li`, `ol`, and `strong`
     * @type {string}
     * @memberof DocumentSignrequest
     */
    message?: string;
    /**
     * `m`: only me, `mo`: me and others, `o`: only others
     * @type {string}
     * @memberof DocumentSignrequest
     */
    who?: DocumentSignrequestWhoEnum;
    /**
     * Automatically remind signers to sign a document, see: [automatic reminders](#section/Working-with-a-SignRequest/Automatic-reminders)
     * @type {boolean}
     * @memberof DocumentSignrequest
     */
    send_reminders?: boolean;
    /**
     * 
     * @type {Array<Signer>}
     * @memberof DocumentSignrequest
     */
    signers?: Array<Signer>;
    /**
     * 
     * @type {string}
     * @memberof DocumentSignrequest
     */
    uuid?: string;
}

/**
    * @export
    * @enum {string}
    */
export enum DocumentSignrequestWhoEnum {
    M = 'm',
    Mo = 'mo',
    O = 'o'
}

/**
 * 
 * @export
 * @interface DocumentTeam
 */
export interface DocumentTeam {
    /**
     * 
     * @type {string}
     * @memberof DocumentTeam
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentTeam
     */
    subdomain?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentTeam
     */
    url?: string;
}
/**
 * 
 * @export
 * @interface Event
 */
export interface Event {
    /**
     * 
     * @type {string}
     * @memberof Event
     */
    uuid?: string;
    /**
     * 
     * @type {string}
     * @memberof Event
     */
    status?: EventStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof Event
     */
    event_type?: EventEventTypeEnum;
    /**
     * 
     * @type {boolean}
     * @memberof Event
     */
    delivered?: boolean;
    /**
     * 
     * @type {string}
     * @memberof Event
     */
    delivered_on?: string;
    /**
     * 
     * @type {number}
     * @memberof Event
     */
    callback_status_code?: number;
    /**
     * 
     * @type {string}
     * @memberof Event
     */
    timestamp?: string;
    /**
     * 
     * @type {DocumentTeam}
     * @memberof Event
     */
    team?: DocumentTeam;
    /**
     * 
     * @type {Document}
     * @memberof Event
     */
    document?: Document;
    /**
     * 
     * @type {Signer}
     * @memberof Event
     */
    signer?: Signer;
}

/**
    * @export
    * @enum {string}
    */
export enum EventStatusEnum {
    Ok = 'ok',
    Error = 'error'
}
/**
    * @export
    * @enum {string}
    */
export enum EventEventTypeEnum {
    ConvertError = 'convert_error',
    Converted = 'converted',
    SendingError = 'sending_error',
    Sent = 'sent',
    Declined = 'declined',
    Cancelled = 'cancelled',
    Expired = 'expired',
    Signed = 'signed',
    Viewed = 'viewed',
    Downloaded = 'downloaded',
    SignerSigned = 'signer_signed',
    SignerEmailBounced = 'signer_email_bounced',
    SignerViewedEmail = 'signer_viewed_email',
    SignerViewed = 'signer_viewed',
    SignerForwarded = 'signer_forwarded',
    SignerDownloaded = 'signer_downloaded',
    SignrequestReceived = 'signrequest_received'
}

/**
 * 
 * @export
 * @interface ExtraDocument
 */
export interface ExtraDocument {
    /**
     * 
     * @type {string}
     * @memberof ExtraDocument
     */
    uuid?: string;
    /**
     * 
     * @type {string}
     * @memberof ExtraDocument
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof ExtraDocument
     */
    status?: string;
    /**
     * 
     * @type {string}
     * @memberof ExtraDocument
     */
    status_display?: string;
}
/**
 * 
 * @export
 * @interface FileFromSf
 */
export interface FileFromSf {
    /**
     * 
     * @type {string}
     * @memberof FileFromSf
     */
    object_type: string;
    /**
     * 
     * @type {string}
     * @memberof FileFromSf
     */
    object_id: string;
    /**
     * 
     * @type {string}
     * @memberof FileFromSf
     */
    uid?: string;
}
/**
 * 
 * @export
 * @interface ForwardSigner
 */
export interface ForwardSigner {
    /**
     * Email of the signer that forwards the SignRequest.
     * @type {string}
     * @memberof ForwardSigner
     */
    signer_email_to_forward: string;
    /**
     * Email of the new signer to forward this SignRequest to.
     * @type {string}
     * @memberof ForwardSigner
     */
    signer_email_to_forward_to: string;
    /**
     * A reason why this SignRequest is forwarded (optional), this will be visible to all parties involved
     * @type {string}
     * @memberof ForwardSigner
     */
    forwarded_reason?: string;
}
/**
 * 
 * @export
 * @interface InlineDocumentSignerIntegrationData
 */
export interface InlineDocumentSignerIntegrationData {
    /**
     * 
     * @type {string}
     * @memberof InlineDocumentSignerIntegrationData
     */
    integration?: InlineDocumentSignerIntegrationDataIntegrationEnum;
    /**
     * 
     * @type {object}
     * @memberof InlineDocumentSignerIntegrationData
     */
    integration_data?: object;
}

/**
    * @export
    * @enum {string}
    */
export enum InlineDocumentSignerIntegrationDataIntegrationEnum {
    Mfiles = 'mfiles',
    Salesforce = 'salesforce',
    Formdesk = 'formdesk',
    Zapier = 'zapier',
    MicrosoftFlow = 'microsoft-flow'
}

/**
 * 
 * @export
 * @interface InlineIntegrationData
 */
export interface InlineIntegrationData {
    /**
     * 
     * @type {string}
     * @memberof InlineIntegrationData
     */
    integration?: InlineIntegrationDataIntegrationEnum;
    /**
     * 
     * @type {object}
     * @memberof InlineIntegrationData
     */
    integration_data?: object;
}

/**
    * @export
    * @enum {string}
    */
export enum InlineIntegrationDataIntegrationEnum {
    Mfiles = 'mfiles',
    Salesforce = 'salesforce',
    Formdesk = 'formdesk',
    Zapier = 'zapier',
    MicrosoftFlow = 'microsoft-flow'
}

/**
 * Prefill signer input data, see [prefill tags](#section/Preparing-a-document/Prefill-tags-templates)
 * @export
 * @interface InlinePrefillTags
 */
export interface InlinePrefillTags {
    /**
     * 
     * @type {string}
     * @memberof InlinePrefillTags
     */
    external_id?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlinePrefillTags
     */
    text?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof InlinePrefillTags
     */
    checkbox_value?: boolean | null;
    /**
     * 
     * @type {string}
     * @memberof InlinePrefillTags
     */
    date_value?: string | null;
}
/**
 * 
 * @export
 * @interface InlineResponse200
 */
export interface InlineResponse200 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse200
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse200
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse200
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<AuthToken>}
     * @memberof InlineResponse200
     */
    results: Array<AuthToken>;
}
/**
 * 
 * @export
 * @interface InlineResponse2001
 */
export interface InlineResponse2001 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2001
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2001
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2001
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<AuditEvent>}
     * @memberof InlineResponse2001
     */
    results: Array<AuditEvent>;
}
/**
 * 
 * @export
 * @interface InlineResponse20010
 */
export interface InlineResponse20010 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20010
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20010
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20010
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<WebhookSubscription>}
     * @memberof InlineResponse20010
     */
    results: Array<WebhookSubscription>;
}
/**
 * 
 * @export
 * @interface InlineResponse2002
 */
export interface InlineResponse2002 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2002
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2002
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2002
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<DocumentAttachment>}
     * @memberof InlineResponse2002
     */
    results: Array<DocumentAttachment>;
}
/**
 * 
 * @export
 * @interface InlineResponse2003
 */
export interface InlineResponse2003 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2003
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2003
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2003
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<DocumentSearchDirect>}
     * @memberof InlineResponse2003
     */
    results: Array<DocumentSearchDirect>;
}
/**
 * 
 * @export
 * @interface InlineResponse2004
 */
export interface InlineResponse2004 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2004
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2004
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2004
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<Document>}
     * @memberof InlineResponse2004
     */
    results: Array<Document>;
}
/**
 * 
 * @export
 * @interface InlineResponse2005
 */
export interface InlineResponse2005 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2005
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2005
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2005
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<Event>}
     * @memberof InlineResponse2005
     */
    results: Array<Event>;
}
/**
 * 
 * @export
 * @interface InlineResponse2006
 */
export interface InlineResponse2006 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2006
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2006
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2006
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<SignRequest>}
     * @memberof InlineResponse2006
     */
    results: Array<SignRequest>;
}
/**
 * 
 * @export
 * @interface InlineResponse2007
 */
export interface InlineResponse2007 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2007
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2007
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2007
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<TeamMember>}
     * @memberof InlineResponse2007
     */
    results: Array<TeamMember>;
}
/**
 * 
 * @export
 * @interface InlineResponse2008
 */
export interface InlineResponse2008 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2008
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2008
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2008
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<Team>}
     * @memberof InlineResponse2008
     */
    results: Array<Team>;
}
/**
 * 
 * @export
 * @interface InlineResponse2009
 */
export interface InlineResponse2009 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2009
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2009
     */
    next?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2009
     */
    previous?: string | null;
    /**
     * 
     * @type {Array<Template>}
     * @memberof InlineResponse2009
     */
    results: Array<Template>;
}
/**
 * 
 * @export
 * @interface InlineResponse201
 */
export interface InlineResponse201 {
    /**
     * 
     * @type {string}
     * @memberof InlineResponse201
     */
    detail: InlineResponse201DetailEnum;
    /**
     * 
     * @type {boolean}
     * @memberof InlineResponse201
     */
    cancelled: boolean;
}

/**
    * @export
    * @enum {string}
    */
export enum InlineResponse201DetailEnum {
    Ok = 'OK'
}

/**
 * 
 * @export
 * @interface InlineResponse2011
 */
export interface InlineResponse2011 {
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2011
     */
    detail: InlineResponse2011DetailEnum;
}

/**
    * @export
    * @enum {string}
    */
export enum InlineResponse2011DetailEnum {
    Ok = 'OK'
}

/**
 * 
 * @export
 * @interface InlineResponse400
 */
export interface InlineResponse400 {
    /**
     * 
     * @type {object}
     * @memberof InlineResponse400
     */
    errors?: object;
}
/**
 * 
 * @export
 * @interface InlineSignRequest
 */
export interface InlineSignRequest {
    /**
     * Email of user sending the SignRequest (must be a validated email)
     * @type {string}
     * @memberof InlineSignRequest
     */
    from_email?: string;
    /**
     * Name to be used in the `From` email header, e.g. `{from_email_name} <no-reply@signrequest.com>`
     * @type {string}
     * @memberof InlineSignRequest
     */
    from_email_name?: string;
    /**
     * Have the sender of a SignRequest prepare the document before sending the request out, see: [prepare using the web interface](#section/Preparing-a-document/Prepare-using-the-web-interface)
     * @type {boolean}
     * @memberof InlineSignRequest
     */
    is_being_prepared?: boolean;
    /**
     * 
     * @type {string}
     * @memberof InlineSignRequest
     */
    prepare_url?: string;
    /**
     * URL at which SignRequest will redirect to when a document is signed
     * @type {string}
     * @memberof InlineSignRequest
     */
    redirect_url?: string;
    /**
     * URL at which SignRequest will redirect to when a document is declined
     * @type {string}
     * @memberof InlineSignRequest
     */
    redirect_url_declined?: string;
    /**
     * 
     * @type {Array<RequiredAttachment>}
     * @memberof InlineSignRequest
     */
    required_attachments?: Array<RequiredAttachment>;
    /**
     * Disable uploading/adding of attachments
     * @type {boolean}
     * @memberof InlineSignRequest
     */
    disable_attachments?: boolean;
    /**
     * Disable usage of signatures generated by typing (text)
     * @type {boolean}
     * @memberof InlineSignRequest
     */
    disable_text_signatures?: boolean;
    /**
     * Disable adding of text
     * @type {boolean}
     * @memberof InlineSignRequest
     */
    disable_text?: boolean;
    /**
     * Disable adding of dates
     * @type {boolean}
     * @memberof InlineSignRequest
     */
    disable_date?: boolean;
    /**
     * Disable all SignRequest status emails as well as the email that contains the signed documents
     * @type {boolean}
     * @memberof InlineSignRequest
     */
    disable_emails?: boolean;
    /**
     * Disable usage of uploaded signatures (images)
     * @type {boolean}
     * @memberof InlineSignRequest
     */
    disable_upload_signatures?: boolean;
    /**
     * Force specific color for the signature
     * @type {string}
     * @memberof InlineSignRequest
     */
    force_signature_color?: string;
    /**
     * Disables storing timestamp proof hashes in blockchain integrations.
     * @type {boolean}
     * @memberof InlineSignRequest
     */
    disable_blockchain_proof?: boolean;
    /**
     * When true a text message verification is needed before the signer can see the document
     * @type {boolean}
     * @memberof InlineSignRequest
     */
    text_message_verification_locked?: boolean;
    /**
     * Subject of SignRequest email
     * @type {string}
     * @memberof InlineSignRequest
     */
    subject?: string;
    /**
     * Message to include in SignRequest email, may contain the following html tags: `a`, `abbr`, `acronym`, `b`, `blockquote`, `code`, `em`, `i`, `ul`, `li`, `ol`, and `strong`
     * @type {string}
     * @memberof InlineSignRequest
     */
    message?: string;
    /**
     * `m`: only me, `mo`: me and others, `o`: only others
     * @type {string}
     * @memberof InlineSignRequest
     */
    who?: InlineSignRequestWhoEnum;
    /**
     * Automatically remind signers to sign a document, see: [automatic reminders](#section/Working-with-a-SignRequest/Automatic-reminders)
     * @type {boolean}
     * @memberof InlineSignRequest
     */
    send_reminders?: boolean;
    /**
     * 
     * @type {Array<Signer>}
     * @memberof InlineSignRequest
     */
    signers?: Array<Signer>;
    /**
     * 
     * @type {string}
     * @memberof InlineSignRequest
     */
    uuid?: string;
}

/**
    * @export
    * @enum {string}
    */
export enum InlineSignRequestWhoEnum {
    M = 'm',
    Mo = 'mo',
    O = 'o'
}

/**
 * 
 * @export
 * @interface InlineTeam
 */
export interface InlineTeam {
    /**
     * 
     * @type {string}
     * @memberof InlineTeam
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineTeam
     */
    subdomain?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineTeam
     */
    url?: string;
}
/**
 * 
 * @export
 * @interface InlineTeamMember
 */
export interface InlineTeamMember {
    /**
     * 
     * @type {string}
     * @memberof InlineTeamMember
     */
    uuid?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineTeamMember
     */
    url?: string;
    /**
     * 
     * @type {User}
     * @memberof InlineTeamMember
     */
    user?: User;
    /**
     * 
     * @type {boolean}
     * @memberof InlineTeamMember
     */
    is_admin?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof InlineTeamMember
     */
    is_active?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof InlineTeamMember
     */
    is_owner?: boolean;
}
/**
 * 
 * @export
 * @interface InviteMember
 */
export interface InviteMember {
    /**
     * 
     * @type {string}
     * @memberof InviteMember
     */
    email: string;
    /**
     * 
     * @type {boolean}
     * @memberof InviteMember
     */
    is_admin?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof InviteMember
     */
    is_owner?: boolean;
}
/**
 * 
 * @export
 * @interface Placeholder
 */
export interface Placeholder {
    /**
     * 
     * @type {string}
     * @memberof Placeholder
     */
    uuid?: string;
    /**
     * 
     * @type {string}
     * @memberof Placeholder
     */
    type?: PlaceholderTypeEnum;
    /**
     * 
     * @type {number}
     * @memberof Placeholder
     */
    page_index: number;
    /**
     * 
     * @type {boolean}
     * @memberof Placeholder
     */
    prefill: boolean;
    /**
     * 
     * @type {string}
     * @memberof Placeholder
     */
    text?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof Placeholder
     */
    checkbox_value?: boolean | null;
    /**
     * 
     * @type {string}
     * @memberof Placeholder
     */
    date_value?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Placeholder
     */
    external_id?: string | null;
}

/**
    * @export
    * @enum {string}
    */
export enum PlaceholderTypeEnum {
    S = 's',
    I = 'i',
    N = 'n',
    D = 'd',
    T = 't',
    C = 'c'
}

/**
 * 
 * @export
 * @interface RequiredAttachment
 */
export interface RequiredAttachment {
    /**
     * 
     * @type {string}
     * @memberof RequiredAttachment
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof RequiredAttachment
     */
    uuid?: string;
}
/**
 * 
 * @export
 * @interface SignRequest
 */
export interface SignRequest {
    /**
     * Email of user sending the SignRequest (must be a validated email)
     * @type {string}
     * @memberof SignRequest
     */
    from_email?: string;
    /**
     * Name to be used in the `From` email header, e.g. `{from_email_name} <no-reply@signrequest.com>`
     * @type {string}
     * @memberof SignRequest
     */
    from_email_name?: string | null;
    /**
     * Have the sender of a SignRequest prepare the document before sending the request out, see: [prepare using the web interface](#section/Preparing-a-document/Prepare-using-the-web-interface)
     * @type {boolean}
     * @memberof SignRequest
     */
    is_being_prepared?: boolean | null;
    /**
     * 
     * @type {string}
     * @memberof SignRequest
     */
    prepare_url?: string;
    /**
     * URL at which SignRequest will redirect to when a document is signed
     * @type {string}
     * @memberof SignRequest
     */
    redirect_url?: string | null;
    /**
     * URL at which SignRequest will redirect to when a document is declined
     * @type {string}
     * @memberof SignRequest
     */
    redirect_url_declined?: string | null;
    /**
     * Attachments that signers are required to upload
     * @type {Array<RequiredAttachment>}
     * @memberof SignRequest
     */
    required_attachments?: Array<RequiredAttachment>;
    /**
     * Disable uploading/adding of attachments
     * @type {boolean}
     * @memberof SignRequest
     */
    disable_attachments?: boolean;
    /**
     * Disable usage of signatures generated by typing (text)
     * @type {boolean}
     * @memberof SignRequest
     */
    disable_text_signatures?: boolean;
    /**
     * Disable adding of text
     * @type {boolean}
     * @memberof SignRequest
     */
    disable_text?: boolean;
    /**
     * Disable adding of dates
     * @type {boolean}
     * @memberof SignRequest
     */
    disable_date?: boolean;
    /**
     * Disable all SignRequest status emails as well as the email that contains the signed documents
     * @type {boolean}
     * @memberof SignRequest
     */
    disable_emails?: boolean;
    /**
     * Disable usage of uploaded signatures (images)
     * @type {boolean}
     * @memberof SignRequest
     */
    disable_upload_signatures?: boolean;
    /**
     * Force specific color for the signature
     * @type {string}
     * @memberof SignRequest
     */
    force_signature_color?: string | null;
    /**
     * Disables storing timestamp proof hashes in blockchain integrations.
     * @type {boolean}
     * @memberof SignRequest
     */
    disable_blockchain_proof?: boolean | null;
    /**
     * When true a text message verification is needed before the signer can see the document
     * @type {boolean}
     * @memberof SignRequest
     */
    text_message_verification_locked?: boolean | null;
    /**
     * Subject of SignRequest email
     * @type {string}
     * @memberof SignRequest
     */
    subject?: string | null;
    /**
     * Message to include in SignRequest email, may contain the following html tags: `a`, `abbr`, `acronym`, `b`, `blockquote`, `code`, `em`, `i`, `ul`, `li`, `ol`, and `strong`
     * @type {string}
     * @memberof SignRequest
     */
    message?: string | null;
    /**
     * `m`: only me, `mo`: me and others, `o`: only others
     * @type {string}
     * @memberof SignRequest
     */
    who?: SignRequestWhoEnum;
    /**
     * Automatically remind signers to sign a document, see: [automatic reminders](#section/Working-with-a-SignRequest/Automatic-reminders)
     * @type {boolean}
     * @memberof SignRequest
     */
    send_reminders?: boolean;
    /**
     * 
     * @type {Array<Signer>}
     * @memberof SignRequest
     */
    signers: Array<Signer>;
    /**
     * 
     * @type {string}
     * @memberof SignRequest
     */
    uuid?: string;
    /**
     * 
     * @type {string}
     * @memberof SignRequest
     */
    url?: string;
    /**
     * 
     * @type {string}
     * @memberof SignRequest
     */
    document: string;
    /**
     * 
     * @type {string}
     * @memberof SignRequest
     */
    integration?: SignRequestIntegrationEnum;
    /**
     * 
     * @type {object}
     * @memberof SignRequest
     */
    integration_data?: object | null;
}

/**
    * @export
    * @enum {string}
    */
export enum SignRequestWhoEnum {
    M = 'm',
    Mo = 'mo',
    O = 'o'
}
/**
    * @export
    * @enum {string}
    */
export enum SignRequestIntegrationEnum {
    Mfiles = 'mfiles',
    Salesforce = 'salesforce',
    Formdesk = 'formdesk',
    Zapier = 'zapier',
    MicrosoftFlow = 'microsoft-flow'
}

/**
 * 
 * @export
 * @interface SignRequestQuickCreate
 */
export interface SignRequestQuickCreate {
    /**
     * Email of user sending the SignRequest (must be a validated email)
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    from_email?: string;
    /**
     * Name to be used in the `From` email header, e.g. `{from_email_name} <no-reply@signrequest.com>`
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    from_email_name?: string | null;
    /**
     * Have the sender of a SignRequest prepare the document before sending the request out, see: [prepare using the web interface](#section/Preparing-a-document/Prepare-using-the-web-interface)
     * @type {boolean}
     * @memberof SignRequestQuickCreate
     */
    is_being_prepared?: boolean | null;
    /**
     * 
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    prepare_url?: string;
    /**
     * URL at which SignRequest will redirect to when a document is signed
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    redirect_url?: string | null;
    /**
     * URL at which SignRequest will redirect to when a document is declined
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    redirect_url_declined?: string | null;
    /**
     * Attachments that signers are required to upload
     * @type {Array<RequiredAttachment>}
     * @memberof SignRequestQuickCreate
     */
    required_attachments?: Array<RequiredAttachment>;
    /**
     * Disable uploading/adding of attachments
     * @type {boolean}
     * @memberof SignRequestQuickCreate
     */
    disable_attachments?: boolean;
    /**
     * Disable usage of signatures generated by typing (text)
     * @type {boolean}
     * @memberof SignRequestQuickCreate
     */
    disable_text_signatures?: boolean;
    /**
     * Disable adding of text
     * @type {boolean}
     * @memberof SignRequestQuickCreate
     */
    disable_text?: boolean;
    /**
     * Disable adding of dates
     * @type {boolean}
     * @memberof SignRequestQuickCreate
     */
    disable_date?: boolean;
    /**
     * Disable all SignRequest status emails as well as the email that contains the signed documents
     * @type {boolean}
     * @memberof SignRequestQuickCreate
     */
    disable_emails?: boolean;
    /**
     * Disable usage of uploaded signatures (images)
     * @type {boolean}
     * @memberof SignRequestQuickCreate
     */
    disable_upload_signatures?: boolean;
    /**
     * Force specific color for the signature
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    force_signature_color?: string | null;
    /**
     * Disables storing timestamp proof hashes in blockchain integrations.
     * @type {boolean}
     * @memberof SignRequestQuickCreate
     */
    disable_blockchain_proof?: boolean | null;
    /**
     * When true a text message verification is needed before the signer can see the document
     * @type {boolean}
     * @memberof SignRequestQuickCreate
     */
    text_message_verification_locked?: boolean | null;
    /**
     * Subject of SignRequest email
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    subject?: string | null;
    /**
     * Message to include in SignRequest email, may contain the following html tags: `a`, `abbr`, `acronym`, `b`, `blockquote`, `code`, `em`, `i`, `ul`, `li`, `ol`, and `strong`
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    message?: string | null;
    /**
     * `m`: only me, `mo`: me and others, `o`: only others
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    who?: SignRequestQuickCreateWhoEnum;
    /**
     * Automatically remind signers to sign a document, see: [automatic reminders](#section/Working-with-a-SignRequest/Automatic-reminders)
     * @type {boolean}
     * @memberof SignRequestQuickCreate
     */
    send_reminders?: boolean;
    /**
     * 
     * @type {Array<Signer>}
     * @memberof SignRequestQuickCreate
     */
    signers: Array<Signer>;
    /**
     * 
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    uuid?: string;
    /**
     * 
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    url?: string;
    /**
     * 
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    document?: string;
    /**
     * 
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    integration?: SignRequestQuickCreateIntegrationEnum;
    /**
     * 
     * @type {object}
     * @memberof SignRequestQuickCreate
     */
    integration_data?: object | null;
    /**
     * Defaults to filename, including extension
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    name?: string | null;
    /**
     * ID used to reference document in external system
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    external_id?: string | null;
    /**
     * Shared secret used in conjunction with <a href=\"#section/Frontend-API/SignRequest-js-client-(beta)\">SignRequest-js client</a> to grant user access to a document that\'s not a member of the document\'s team
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    frontend_id?: string | null;
    /**
     * Temporary URL to original file, expires in five minutes
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    file?: string | null;
    /**
     * Publicly accessible URL of document to be downloaded by SignRequest
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    file_from_url?: string | null;
    /**
     * URL at which to receive [event callbacks](#section/Events/Events-callback) for this document
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    events_callback_url?: string | null;
    /**
     * Base64 encoded document content
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    file_from_content?: string | null;
    /**
     * Filename, including extension. Required when using `file_from_content`.
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    file_from_content_name?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SignRequestQuickCreate
     */
    template?: string | null;
    /**
     * Prefill signer input data, see [prefill tags](#section/Preparing-a-document/Prefill-tags-templates)
     * @type {Array<InlinePrefillTags>}
     * @memberof SignRequestQuickCreate
     */
    prefill_tags?: Array<InlinePrefillTags>;
    /**
     * 
     * @type {Array<InlineIntegrationData>}
     * @memberof SignRequestQuickCreate
     */
    integrations?: Array<InlineIntegrationData>;
    /**
     * 
     * @type {FileFromSf}
     * @memberof SignRequestQuickCreate
     */
    file_from_sf?: FileFromSf | null;
    /**
     * Number of days after which a finished document (signed/cancelled/declined) will be automatically deleted
     * @type {number}
     * @memberof SignRequestQuickCreate
     */
    auto_delete_days?: number | null;
    /**
     * Number of days after which a non finished document will be automatically expired
     * @type {number}
     * @memberof SignRequestQuickCreate
     */
    auto_expire_days?: number | null;
}

/**
    * @export
    * @enum {string}
    */
export enum SignRequestQuickCreateWhoEnum {
    M = 'm',
    Mo = 'mo',
    O = 'o'
}
/**
    * @export
    * @enum {string}
    */
export enum SignRequestQuickCreateIntegrationEnum {
    Mfiles = 'mfiles',
    Salesforce = 'salesforce',
    Formdesk = 'formdesk',
    Zapier = 'zapier',
    MicrosoftFlow = 'microsoft-flow'
}

/**
 * 
 * @export
 * @interface Signer
 */
export interface Signer {
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    display_name?: string;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    first_name?: string;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    last_name?: string;
    /**
     * 
     * @type {boolean}
     * @memberof Signer
     */
    email_viewed?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof Signer
     */
    viewed?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof Signer
     */
    signed?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof Signer
     */
    downloaded?: boolean;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    signed_on?: string;
    /**
     * When `false` user does not need to sign, but will receive a copy of the signed document and signing log, see: [Copy only](#section/Additional-signing-methods/Copy-only)
     * @type {boolean}
     * @memberof Signer
     */
    needs_to_sign?: boolean;
    /**
     * Require user to approve the document (without adding a signature), see: [Approve only](#section/Additional-signing-methods/Approve-only)
     * @type {boolean}
     * @memberof Signer
     */
    approve_only?: boolean;
    /**
     * Send notifications about the document and a copy of the signed document and signing log, but don\'t require them to take any action, see: [Notify only](#section/Additional-signing-methods/Notify-only)
     * @type {boolean}
     * @memberof Signer
     */
    notify_only?: boolean;
    /**
     * When used in combination with an embed url on the sender, after sender has signed, they will be redirected to the next `in_person` signer, see: [In person signing](#section/Additional-signing-methods/In-person-signing)
     * @type {boolean}
     * @memberof Signer
     */
    in_person?: boolean;
    /**
     * 
     * @type {number}
     * @memberof Signer
     */
    order?: number;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    language?: SignerLanguageEnum;
    /**
     * 
     * @type {boolean}
     * @memberof Signer
     */
    force_language?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof Signer
     */
    emailed?: boolean;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    verify_phone_number?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    verify_bank_account?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof Signer
     */
    declined?: boolean;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    declined_on?: string;
    /**
     * 
     * @type {boolean}
     * @memberof Signer
     */
    forwarded?: boolean;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    forwarded_on?: string;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    forwarded_to_email?: string;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    forwarded_reason?: string;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    message?: string;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    embed_url_user_id?: string | null;
    /**
     * 
     * @type {Array<SignerInputs>}
     * @memberof Signer
     */
    inputs?: Array<SignerInputs>;
    /**
     * Place an approval stamp on a document when a signer approves a document
     * @type {boolean}
     * @memberof Signer
     */
    use_stamp_for_approve_only?: boolean | null;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    embed_url?: string;
    /**
     * 
     * @type {Array<SignerAttachment>}
     * @memberof Signer
     */
    attachments?: Array<SignerAttachment>;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    redirect_url?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    redirect_url_declined?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Signer
     */
    after_document?: string;
    /**
     * 
     * @type {Array<InlineDocumentSignerIntegrationData>}
     * @memberof Signer
     */
    integrations?: Array<InlineDocumentSignerIntegrationData>;
    /**
     * Require the signer to enter this password before signing a document. This field is write only.
     * @type {string}
     * @memberof Signer
     */
    password?: string;
}

/**
    * @export
    * @enum {string}
    */
export enum SignerLanguageEnum {
    En = 'en',
    EnGb = 'en-gb',
    Nl = 'nl',
    Fr = 'fr',
    De = 'de',
    He = 'he',
    Da = 'da',
    Fi = 'fi',
    Hu = 'hu',
    It = 'it',
    No = 'no',
    Pl = 'pl',
    Pt = 'pt',
    Es = 'es',
    Sv = 'sv',
    Ru = 'ru',
    Ja = 'ja'
}

/**
 * 
 * @export
 * @interface SignerAttachment
 */
export interface SignerAttachment {
    /**
     * 
     * @type {string}
     * @memberof SignerAttachment
     */
    uuid?: string;
    /**
     * Defaults to filename
     * @type {string}
     * @memberof SignerAttachment
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof SignerAttachment
     */
    file?: string | null;
    /**
     * 
     * @type {RequiredAttachment}
     * @memberof SignerAttachment
     */
    for_attachment?: RequiredAttachment;
}
/**
 * 
 * @export
 * @interface SignerInputs
 */
export interface SignerInputs {
    /**
     * 
     * @type {string}
     * @memberof SignerInputs
     */
    type?: SignerInputsTypeEnum;
    /**
     * 
     * @type {number}
     * @memberof SignerInputs
     */
    page_index: number;
    /**
     * 
     * @type {string}
     * @memberof SignerInputs
     */
    text?: string;
    /**
     * 
     * @type {boolean}
     * @memberof SignerInputs
     */
    checkbox_value?: boolean | null;
    /**
     * 
     * @type {string}
     * @memberof SignerInputs
     */
    date_value?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SignerInputs
     */
    external_id?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SignerInputs
     */
    placeholder_uuid?: string | null;
}

/**
    * @export
    * @enum {string}
    */
export enum SignerInputsTypeEnum {
    S = 's',
    I = 'i',
    N = 'n',
    D = 'd',
    T = 't',
    C = 'c'
}

/**
 * 
 * @export
 * @interface SigningLog
 */
export interface SigningLog {
    /**
     * Temporary URL to signing log, expires in five minutes
     * @type {string}
     * @memberof SigningLog
     */
    pdf?: string | null;
    /**
     * SHA256 hash of PDF contents
     * @type {string}
     * @memberof SigningLog
     */
    security_hash?: string;
}
/**
 * 
 * @export
 * @interface Team
 */
export interface Team {
    /**
     * 
     * @type {string}
     * @memberof Team
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof Team
     */
    subdomain: string;
    /**
     * 
     * @type {string}
     * @memberof Team
     */
    url?: string;
    /**
     * 
     * @type {string}
     * @memberof Team
     */
    logo?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Team
     */
    phone?: string;
    /**
     * 
     * @type {string}
     * @memberof Team
     */
    primary_color?: string;
    /**
     * 
     * @type {string}
     * @memberof Team
     */
    events_callback_url?: string | null;
    /**
     * 
     * @type {Array<InlineTeamMember>}
     * @memberof Team
     */
    members?: Array<InlineTeamMember>;
    /**
     * When filled this team will be deleted after this date
     * @type {string}
     * @memberof Team
     */
    delete_after?: string;
    /**
     * Indicates whether team is in Sandbox mode
     * @type {boolean}
     * @memberof Team
     */
    sandbox?: boolean;
}
/**
 * 
 * @export
 * @interface TeamMember
 */
export interface TeamMember {
    /**
     * 
     * @type {string}
     * @memberof TeamMember
     */
    uuid?: string;
    /**
     * 
     * @type {string}
     * @memberof TeamMember
     */
    url?: string;
    /**
     * 
     * @type {User}
     * @memberof TeamMember
     */
    user?: User;
    /**
     * 
     * @type {DocumentTeam}
     * @memberof TeamMember
     */
    team?: DocumentTeam;
    /**
     * 
     * @type {boolean}
     * @memberof TeamMember
     */
    is_admin?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof TeamMember
     */
    is_active?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof TeamMember
     */
    is_owner?: boolean;
}
/**
 * 
 * @export
 * @interface Template
 */
export interface Template {
    /**
     * 
     * @type {string}
     * @memberof Template
     */
    url?: string;
    /**
     * Defaults to filename
     * @type {string}
     * @memberof Template
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof Template
     */
    uuid?: string;
    /**
     * 
     * @type {User}
     * @memberof Template
     */
    user?: User;
    /**
     * 
     * @type {DocumentTeam}
     * @memberof Template
     */
    team?: DocumentTeam;
    /**
     * `m`: only me, `mo`: me and others, `o`: only others
     * @type {string}
     * @memberof Template
     */
    who?: TemplateWhoEnum;
    /**
     * 
     * @type {Array<DocumentSignerTemplateConf>}
     * @memberof Template
     */
    signers?: Array<DocumentSignerTemplateConf>;
}

/**
    * @export
    * @enum {string}
    */
export enum TemplateWhoEnum {
    M = 'm',
    Mo = 'mo',
    O = 'o'
}

/**
 * 
 * @export
 * @interface User
 */
export interface User {
    /**
     * 
     * @type {string}
     * @memberof User
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    first_name?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    last_name?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    display_name?: string;
}
/**
 * 
 * @export
 * @interface WebhookSubscription
 */
export interface WebhookSubscription {
    /**
     * 
     * @type {string}
     * @memberof WebhookSubscription
     */
    url?: string;
    /**
     * 
     * @type {string}
     * @memberof WebhookSubscription
     */
    uuid?: string;
    /**
     * Optional name to easily identify what webhook is used for
     * @type {string}
     * @memberof WebhookSubscription
     */
    name?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WebhookSubscription
     */
    event_type: WebhookSubscriptionEventTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof WebhookSubscription
     */
    callback_url: string;
    /**
     * 
     * @type {string}
     * @memberof WebhookSubscription
     */
    integration?: WebhookSubscriptionIntegrationEnum;
    /**
     * 
     * @type {DocumentTeam}
     * @memberof WebhookSubscription
     */
    team?: DocumentTeam;
    /**
     * 
     * @type {string}
     * @memberof WebhookSubscription
     */
    created?: string;
}

/**
    * @export
    * @enum {string}
    */
export enum WebhookSubscriptionEventTypeEnum {
    ConvertError = 'convert_error',
    Converted = 'converted',
    SendingError = 'sending_error',
    Sent = 'sent',
    Declined = 'declined',
    Cancelled = 'cancelled',
    Expired = 'expired',
    Signed = 'signed',
    Viewed = 'viewed',
    Downloaded = 'downloaded',
    SignerSigned = 'signer_signed',
    SignerEmailBounced = 'signer_email_bounced',
    SignerViewedEmail = 'signer_viewed_email',
    SignerViewed = 'signer_viewed',
    SignerForwarded = 'signer_forwarded',
    SignerDownloaded = 'signer_downloaded',
    SignrequestReceived = 'signrequest_received',
    LoginFailed = 'login_failed',
    LoginSuccessful = 'login_successful',
    PasswordResetRequestSent = 'password_reset_request_sent',
    PasswordResetRequestError = 'password_reset_request_error'
}
/**
    * @export
    * @enum {string}
    */
export enum WebhookSubscriptionIntegrationEnum {
    Mfiles = 'mfiles',
    Salesforce = 'salesforce',
    Formdesk = 'formdesk',
    Zapier = 'zapier',
    MicrosoftFlow = 'microsoft-flow'
}


/**
 * ApiTokensApi - axios parameter creator
 * @export
 */
export const ApiTokensApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Retrieve a list of API tokens
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        apiTokensList: async (page?: number, limit?: number, options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/api-tokens/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * ApiTokensApi - functional programming interface
 * @export
 */
export const ApiTokensApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = ApiTokensApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Retrieve a list of API tokens
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async apiTokensList(page?: number, limit?: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse200>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.apiTokensList(page, limit, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * ApiTokensApi - factory interface
 * @export
 */
export const ApiTokensApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = ApiTokensApiFp(configuration)
    return {
        /**
         * 
         * @summary Retrieve a list of API tokens
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        apiTokensList(page?: number, limit?: number, options?: any): AxiosPromise<InlineResponse200> {
            return localVarFp.apiTokensList(page, limit, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * ApiTokensApi - object-oriented interface
 * @export
 * @class ApiTokensApi
 * @extends {BaseAPI}
 */
export class ApiTokensApi extends BaseAPI {
    /**
     * 
     * @summary Retrieve a list of API tokens
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [limit] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiTokensApi
     */
    public apiTokensList(page?: number, limit?: number, options?: any) {
        return ApiTokensApiFp(this.configuration).apiTokensList(page, limit, options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * AuditEventsApi - axios parameter creator
 * @export
 */
export const AuditEventsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Retrieve a list of AuditEvents
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {string} [userEmail] 
         * @param {string} [userIp] 
         * @param {string} [eventType] &#x60;login_failed&#x60;: Login failed, &#x60;login_successful&#x60;: Login successful, &#x60;password_reset_request_sent&#x60;: Password reset request sent, &#x60;password_reset_request_error&#x60;: Password reset request error
         * @param {string} [status] &#x60;success&#x60;: Success, &#x60;error&#x60;: Error
         * @param {string} [timestampDateLt] Date format YYYY-MM-DD
         * @param {string} [timestampDateLte] Date format YYYY-MM-DD
         * @param {string} [timestampDateGt] Date format YYYY-MM-DD
         * @param {string} [timestampDateGte] Date format YYYY-MM-DD
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        auditEventsList: async (page?: number, limit?: number, userEmail?: string, userIp?: string, eventType?: string, status?: string, timestampDateLt?: string, timestampDateLte?: string, timestampDateGt?: string, timestampDateGte?: string, options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/audit-events/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }

            if (userEmail !== undefined) {
                localVarQueryParameter['user_email'] = userEmail;
            }

            if (userIp !== undefined) {
                localVarQueryParameter['user_ip'] = userIp;
            }

            if (eventType !== undefined) {
                localVarQueryParameter['event_type'] = eventType;
            }

            if (status !== undefined) {
                localVarQueryParameter['status'] = status;
            }

            if (timestampDateLt !== undefined) {
                localVarQueryParameter['timestamp__date__lt'] = timestampDateLt;
            }

            if (timestampDateLte !== undefined) {
                localVarQueryParameter['timestamp__date__lte'] = timestampDateLte;
            }

            if (timestampDateGt !== undefined) {
                localVarQueryParameter['timestamp__date__gt'] = timestampDateGt;
            }

            if (timestampDateGte !== undefined) {
                localVarQueryParameter['timestamp__date__gte'] = timestampDateGte;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * AuditEventsApi - functional programming interface
 * @export
 */
export const AuditEventsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = AuditEventsApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Retrieve a list of AuditEvents
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {string} [userEmail] 
         * @param {string} [userIp] 
         * @param {string} [eventType] &#x60;login_failed&#x60;: Login failed, &#x60;login_successful&#x60;: Login successful, &#x60;password_reset_request_sent&#x60;: Password reset request sent, &#x60;password_reset_request_error&#x60;: Password reset request error
         * @param {string} [status] &#x60;success&#x60;: Success, &#x60;error&#x60;: Error
         * @param {string} [timestampDateLt] Date format YYYY-MM-DD
         * @param {string} [timestampDateLte] Date format YYYY-MM-DD
         * @param {string} [timestampDateGt] Date format YYYY-MM-DD
         * @param {string} [timestampDateGte] Date format YYYY-MM-DD
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async auditEventsList(page?: number, limit?: number, userEmail?: string, userIp?: string, eventType?: string, status?: string, timestampDateLt?: string, timestampDateLte?: string, timestampDateGt?: string, timestampDateGte?: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse2001>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.auditEventsList(page, limit, userEmail, userIp, eventType, status, timestampDateLt, timestampDateLte, timestampDateGt, timestampDateGte, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * AuditEventsApi - factory interface
 * @export
 */
export const AuditEventsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = AuditEventsApiFp(configuration)
    return {
        /**
         * 
         * @summary Retrieve a list of AuditEvents
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {string} [userEmail] 
         * @param {string} [userIp] 
         * @param {string} [eventType] &#x60;login_failed&#x60;: Login failed, &#x60;login_successful&#x60;: Login successful, &#x60;password_reset_request_sent&#x60;: Password reset request sent, &#x60;password_reset_request_error&#x60;: Password reset request error
         * @param {string} [status] &#x60;success&#x60;: Success, &#x60;error&#x60;: Error
         * @param {string} [timestampDateLt] Date format YYYY-MM-DD
         * @param {string} [timestampDateLte] Date format YYYY-MM-DD
         * @param {string} [timestampDateGt] Date format YYYY-MM-DD
         * @param {string} [timestampDateGte] Date format YYYY-MM-DD
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        auditEventsList(page?: number, limit?: number, userEmail?: string, userIp?: string, eventType?: string, status?: string, timestampDateLt?: string, timestampDateLte?: string, timestampDateGt?: string, timestampDateGte?: string, options?: any): AxiosPromise<InlineResponse2001> {
            return localVarFp.auditEventsList(page, limit, userEmail, userIp, eventType, status, timestampDateLt, timestampDateLte, timestampDateGt, timestampDateGte, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * AuditEventsApi - object-oriented interface
 * @export
 * @class AuditEventsApi
 * @extends {BaseAPI}
 */
export class AuditEventsApi extends BaseAPI {
    /**
     * 
     * @summary Retrieve a list of AuditEvents
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [limit] Number of results to return per page.
     * @param {string} [userEmail] 
     * @param {string} [userIp] 
     * @param {string} [eventType] &#x60;login_failed&#x60;: Login failed, &#x60;login_successful&#x60;: Login successful, &#x60;password_reset_request_sent&#x60;: Password reset request sent, &#x60;password_reset_request_error&#x60;: Password reset request error
     * @param {string} [status] &#x60;success&#x60;: Success, &#x60;error&#x60;: Error
     * @param {string} [timestampDateLt] Date format YYYY-MM-DD
     * @param {string} [timestampDateLte] Date format YYYY-MM-DD
     * @param {string} [timestampDateGt] Date format YYYY-MM-DD
     * @param {string} [timestampDateGte] Date format YYYY-MM-DD
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuditEventsApi
     */
    public auditEventsList(page?: number, limit?: number, userEmail?: string, userIp?: string, eventType?: string, status?: string, timestampDateLt?: string, timestampDateLte?: string, timestampDateGt?: string, timestampDateGte?: string, options?: any) {
        return AuditEventsApiFp(this.configuration).auditEventsList(page, limit, userEmail, userIp, eventType, status, timestampDateLt, timestampDateLte, timestampDateGt, timestampDateGte, options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * DocumentAttachmentsApi - axios parameter creator
 * @export
 */
export const DocumentAttachmentsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Create a Document Attachment
         * @param {DocumentAttachment} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentAttachmentsCreate: async (data: DocumentAttachment, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'data' is not null or undefined
            assertParamExists('documentAttachmentsCreate', 'data', data)
            const localVarPath = `/document-attachments/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(data, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Retrieve a list of Document Attachments
         * @param {string} [documentUuid] 
         * @param {string} [documentExternalId] 
         * @param {string} [created] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentAttachmentsList: async (documentUuid?: string, documentExternalId?: string, created?: string, page?: number, limit?: number, options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/document-attachments/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (documentUuid !== undefined) {
                localVarQueryParameter['document__uuid'] = documentUuid;
            }

            if (documentExternalId !== undefined) {
                localVarQueryParameter['document__external_id'] = documentExternalId;
            }

            if (created !== undefined) {
                localVarQueryParameter['created'] = created;
            }

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Retrieve a Document Attachment
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentAttachmentsRead: async (uuid: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('documentAttachmentsRead', 'uuid', uuid)
            const localVarPath = `/document-attachments/{uuid}/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * DocumentAttachmentsApi - functional programming interface
 * @export
 */
export const DocumentAttachmentsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = DocumentAttachmentsApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Create a Document Attachment
         * @param {DocumentAttachment} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async documentAttachmentsCreate(data: DocumentAttachment, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<DocumentAttachment>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.documentAttachmentsCreate(data, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Retrieve a list of Document Attachments
         * @param {string} [documentUuid] 
         * @param {string} [documentExternalId] 
         * @param {string} [created] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async documentAttachmentsList(documentUuid?: string, documentExternalId?: string, created?: string, page?: number, limit?: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse2002>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.documentAttachmentsList(documentUuid, documentExternalId, created, page, limit, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Retrieve a Document Attachment
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async documentAttachmentsRead(uuid: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<DocumentAttachment>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.documentAttachmentsRead(uuid, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * DocumentAttachmentsApi - factory interface
 * @export
 */
export const DocumentAttachmentsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = DocumentAttachmentsApiFp(configuration)
    return {
        /**
         * 
         * @summary Create a Document Attachment
         * @param {DocumentAttachment} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentAttachmentsCreate(data: DocumentAttachment, options?: any): AxiosPromise<DocumentAttachment> {
            return localVarFp.documentAttachmentsCreate(data, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Retrieve a list of Document Attachments
         * @param {string} [documentUuid] 
         * @param {string} [documentExternalId] 
         * @param {string} [created] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentAttachmentsList(documentUuid?: string, documentExternalId?: string, created?: string, page?: number, limit?: number, options?: any): AxiosPromise<InlineResponse2002> {
            return localVarFp.documentAttachmentsList(documentUuid, documentExternalId, created, page, limit, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Retrieve a Document Attachment
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentAttachmentsRead(uuid: string, options?: any): AxiosPromise<DocumentAttachment> {
            return localVarFp.documentAttachmentsRead(uuid, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * DocumentAttachmentsApi - object-oriented interface
 * @export
 * @class DocumentAttachmentsApi
 * @extends {BaseAPI}
 */
export class DocumentAttachmentsApi extends BaseAPI {
    /**
     * 
     * @summary Create a Document Attachment
     * @param {DocumentAttachment} data 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DocumentAttachmentsApi
     */
    public documentAttachmentsCreate(data: DocumentAttachment, options?: any) {
        return DocumentAttachmentsApiFp(this.configuration).documentAttachmentsCreate(data, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Retrieve a list of Document Attachments
     * @param {string} [documentUuid] 
     * @param {string} [documentExternalId] 
     * @param {string} [created] 
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [limit] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DocumentAttachmentsApi
     */
    public documentAttachmentsList(documentUuid?: string, documentExternalId?: string, created?: string, page?: number, limit?: number, options?: any) {
        return DocumentAttachmentsApiFp(this.configuration).documentAttachmentsList(documentUuid, documentExternalId, created, page, limit, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Retrieve a Document Attachment
     * @param {string} uuid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DocumentAttachmentsApi
     */
    public documentAttachmentsRead(uuid: string, options?: any) {
        return DocumentAttachmentsApiFp(this.configuration).documentAttachmentsRead(uuid, options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * DocumentsApi - axios parameter creator
 * @export
 */
export const DocumentsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Create a Document
         * @param {Document} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentsCreate: async (data: Document, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'data' is not null or undefined
            assertParamExists('documentsCreate', 'data', data)
            const localVarPath = `/documents/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(data, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Delete a Document
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentsDelete: async (uuid: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('documentsDelete', 'uuid', uuid)
            const localVarPath = `/documents/{uuid}/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'DELETE', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Retrieve a list of Documents
         * @param {string} [externalId] 
         * @param {string} [signrequestWho] 
         * @param {string} [signrequestFromEmail] 
         * @param {string} [status] 
         * @param {string} [userEmail] 
         * @param {string} [userFirstName] 
         * @param {string} [userLastName] 
         * @param {string} [created] 
         * @param {string} [modified] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentsList: async (externalId?: string, signrequestWho?: string, signrequestFromEmail?: string, status?: string, userEmail?: string, userFirstName?: string, userLastName?: string, created?: string, modified?: string, page?: number, limit?: number, options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/documents/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (externalId !== undefined) {
                localVarQueryParameter['external_id'] = externalId;
            }

            if (signrequestWho !== undefined) {
                localVarQueryParameter['signrequest__who'] = signrequestWho;
            }

            if (signrequestFromEmail !== undefined) {
                localVarQueryParameter['signrequest__from_email'] = signrequestFromEmail;
            }

            if (status !== undefined) {
                localVarQueryParameter['status'] = status;
            }

            if (userEmail !== undefined) {
                localVarQueryParameter['user__email'] = userEmail;
            }

            if (userFirstName !== undefined) {
                localVarQueryParameter['user__first_name'] = userFirstName;
            }

            if (userLastName !== undefined) {
                localVarQueryParameter['user__last_name'] = userLastName;
            }

            if (created !== undefined) {
                localVarQueryParameter['created'] = created;
            }

            if (modified !== undefined) {
                localVarQueryParameter['modified'] = modified;
            }

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Retrieve a Document
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentsRead: async (uuid: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('documentsRead', 'uuid', uuid)
            const localVarPath = `/documents/{uuid}/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * DocumentsApi - functional programming interface
 * @export
 */
export const DocumentsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = DocumentsApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Create a Document
         * @param {Document} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async documentsCreate(data: Document, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Document>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.documentsCreate(data, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Delete a Document
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async documentsDelete(uuid: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.documentsDelete(uuid, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Retrieve a list of Documents
         * @param {string} [externalId] 
         * @param {string} [signrequestWho] 
         * @param {string} [signrequestFromEmail] 
         * @param {string} [status] 
         * @param {string} [userEmail] 
         * @param {string} [userFirstName] 
         * @param {string} [userLastName] 
         * @param {string} [created] 
         * @param {string} [modified] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async documentsList(externalId?: string, signrequestWho?: string, signrequestFromEmail?: string, status?: string, userEmail?: string, userFirstName?: string, userLastName?: string, created?: string, modified?: string, page?: number, limit?: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse2004>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.documentsList(externalId, signrequestWho, signrequestFromEmail, status, userEmail, userFirstName, userLastName, created, modified, page, limit, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Retrieve a Document
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async documentsRead(uuid: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Document>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.documentsRead(uuid, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * DocumentsApi - factory interface
 * @export
 */
export const DocumentsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = DocumentsApiFp(configuration)
    return {
        /**
         * 
         * @summary Create a Document
         * @param {Document} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentsCreate(data: Document, options?: any): AxiosPromise<Document> {
            return localVarFp.documentsCreate(data, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Delete a Document
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentsDelete(uuid: string, options?: any): AxiosPromise<void> {
            return localVarFp.documentsDelete(uuid, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Retrieve a list of Documents
         * @param {string} [externalId] 
         * @param {string} [signrequestWho] 
         * @param {string} [signrequestFromEmail] 
         * @param {string} [status] 
         * @param {string} [userEmail] 
         * @param {string} [userFirstName] 
         * @param {string} [userLastName] 
         * @param {string} [created] 
         * @param {string} [modified] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentsList(externalId?: string, signrequestWho?: string, signrequestFromEmail?: string, status?: string, userEmail?: string, userFirstName?: string, userLastName?: string, created?: string, modified?: string, page?: number, limit?: number, options?: any): AxiosPromise<InlineResponse2004> {
            return localVarFp.documentsList(externalId, signrequestWho, signrequestFromEmail, status, userEmail, userFirstName, userLastName, created, modified, page, limit, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Retrieve a Document
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentsRead(uuid: string, options?: any): AxiosPromise<Document> {
            return localVarFp.documentsRead(uuid, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * DocumentsApi - object-oriented interface
 * @export
 * @class DocumentsApi
 * @extends {BaseAPI}
 */
export class DocumentsApi extends BaseAPI {
    /**
     * 
     * @summary Create a Document
     * @param {Document} data 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DocumentsApi
     */
    public documentsCreate(data: Document, options?: any) {
        return DocumentsApiFp(this.configuration).documentsCreate(data, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Delete a Document
     * @param {string} uuid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DocumentsApi
     */
    public documentsDelete(uuid: string, options?: any) {
        return DocumentsApiFp(this.configuration).documentsDelete(uuid, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Retrieve a list of Documents
     * @param {string} [externalId] 
     * @param {string} [signrequestWho] 
     * @param {string} [signrequestFromEmail] 
     * @param {string} [status] 
     * @param {string} [userEmail] 
     * @param {string} [userFirstName] 
     * @param {string} [userLastName] 
     * @param {string} [created] 
     * @param {string} [modified] 
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [limit] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DocumentsApi
     */
    public documentsList(externalId?: string, signrequestWho?: string, signrequestFromEmail?: string, status?: string, userEmail?: string, userFirstName?: string, userLastName?: string, created?: string, modified?: string, page?: number, limit?: number, options?: any) {
        return DocumentsApiFp(this.configuration).documentsList(externalId, signrequestWho, signrequestFromEmail, status, userEmail, userFirstName, userLastName, created, modified, page, limit, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Retrieve a Document
     * @param {string} uuid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DocumentsApi
     */
    public documentsRead(uuid: string, options?: any) {
        return DocumentsApiFp(this.configuration).documentsRead(uuid, options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * DocumentsSearchApi - axios parameter creator
 * @export
 */
export const DocumentsSearchApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Search interface for fast (autocomplete) searching of documents.  This can be useful to have your users search for a document in your interface.  Document names are tokenized on whitespace, hyphens and underscores to also match partial document names.  *Normal search:*  - ?**q**={{query}}  *Autocomplete search:*  - ?**autocomplete**={{partial query}}  *Search in document name:*  - ?**name**={{query}}  *Available (extra) filters:*  - ?**subdomain**={{ team_subdomain }} or use this endpoint with team_subdomain.signrequest.com (when not provided only personal documents are shown) - ?**signer_emails**={{ signer@email.com }} (will filter documents that an email needed to sign/approve) - ?**status**={{ si }} - ?**who**={{ mo }}  To include multiple values for a filter field separate the values with a pipe (|). For example to only search for completed documents use **status=se|vi** (sent and viewed).  *Pagination:*  - ?**page**={{ page_number: default 1 }} - ?**limit**={{ limit results: default 10, max 100 }}  *Format:*  By default json is returned, to export data as csv or xls use the format parameter.  - ?**format**=csv - ?**format**=xls  For csv and xls the data can also be exported with each signer on a separate row. In this mode also the signer inputs that have an *external_id* specified on a tag will be exported. All external_id\'s found will be exported as columns. To use this mode add the **signer_data** parameter.  - ?**format**=csv&**signer_data**=1 - ?**format**=xls&**signer_data**=1  Note that all documents are only ordered by **created** (newest first) when **q**, **autocomplete** or **name** are not used, else they are ordered by the strenght of the match.
         * @summary Search documents
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {string} [q] Normal search query
         * @param {string} [autocomplete] Partial search query
         * @param {string} [name] Document name
         * @param {string} [subdomain] 
         * @param {string} [signerEmails] Email needed to sign/approve
         * @param {string} [status] &#x60;co&#x60;: converting, &#x60;ne&#x60;: new, &#x60;se&#x60;: sent, &#x60;vi&#x60;: viewed, &#x60;si&#x60;: signed, &#x60;do&#x60;: downloaded, &#x60;sd&#x60;: signed and downloaded, &#x60;ca&#x60;: cancelled, &#x60;de&#x60;: declined, &#x60;ec&#x60;: error converting, &#x60;es&#x60;: error sending, &#x60;xp&#x60;: expired
         * @param {string} [who] &#x60;m&#x60;: only me, &#x60;mo&#x60;: me and others, &#x60;o&#x60;: only others
         * @param {string} [format] Export format, can be &#x60;json&#x60; (default), &#x60;csv&#x60;, or &#x60;xls&#x60;
         * @param {number} [signerData] Set to &#x60;1&#x60; to export with each signer on a separate row
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentsSearchList: async (page?: number, limit?: number, q?: string, autocomplete?: string, name?: string, subdomain?: string, signerEmails?: string, status?: string, who?: string, format?: string, signerData?: number, options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/documents-search/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }

            if (q !== undefined) {
                localVarQueryParameter['q'] = q;
            }

            if (autocomplete !== undefined) {
                localVarQueryParameter['autocomplete'] = autocomplete;
            }

            if (name !== undefined) {
                localVarQueryParameter['name'] = name;
            }

            if (subdomain !== undefined) {
                localVarQueryParameter['subdomain'] = subdomain;
            }

            if (signerEmails !== undefined) {
                localVarQueryParameter['signer_emails'] = signerEmails;
            }

            if (status !== undefined) {
                localVarQueryParameter['status'] = status;
            }

            if (who !== undefined) {
                localVarQueryParameter['who'] = who;
            }

            if (format !== undefined) {
                localVarQueryParameter['format'] = format;
            }

            if (signerData !== undefined) {
                localVarQueryParameter['signer_data'] = signerData;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * DocumentsSearchApi - functional programming interface
 * @export
 */
export const DocumentsSearchApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = DocumentsSearchApiAxiosParamCreator(configuration)
    return {
        /**
         * Search interface for fast (autocomplete) searching of documents.  This can be useful to have your users search for a document in your interface.  Document names are tokenized on whitespace, hyphens and underscores to also match partial document names.  *Normal search:*  - ?**q**={{query}}  *Autocomplete search:*  - ?**autocomplete**={{partial query}}  *Search in document name:*  - ?**name**={{query}}  *Available (extra) filters:*  - ?**subdomain**={{ team_subdomain }} or use this endpoint with team_subdomain.signrequest.com (when not provided only personal documents are shown) - ?**signer_emails**={{ signer@email.com }} (will filter documents that an email needed to sign/approve) - ?**status**={{ si }} - ?**who**={{ mo }}  To include multiple values for a filter field separate the values with a pipe (|). For example to only search for completed documents use **status=se|vi** (sent and viewed).  *Pagination:*  - ?**page**={{ page_number: default 1 }} - ?**limit**={{ limit results: default 10, max 100 }}  *Format:*  By default json is returned, to export data as csv or xls use the format parameter.  - ?**format**=csv - ?**format**=xls  For csv and xls the data can also be exported with each signer on a separate row. In this mode also the signer inputs that have an *external_id* specified on a tag will be exported. All external_id\'s found will be exported as columns. To use this mode add the **signer_data** parameter.  - ?**format**=csv&**signer_data**=1 - ?**format**=xls&**signer_data**=1  Note that all documents are only ordered by **created** (newest first) when **q**, **autocomplete** or **name** are not used, else they are ordered by the strenght of the match.
         * @summary Search documents
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {string} [q] Normal search query
         * @param {string} [autocomplete] Partial search query
         * @param {string} [name] Document name
         * @param {string} [subdomain] 
         * @param {string} [signerEmails] Email needed to sign/approve
         * @param {string} [status] &#x60;co&#x60;: converting, &#x60;ne&#x60;: new, &#x60;se&#x60;: sent, &#x60;vi&#x60;: viewed, &#x60;si&#x60;: signed, &#x60;do&#x60;: downloaded, &#x60;sd&#x60;: signed and downloaded, &#x60;ca&#x60;: cancelled, &#x60;de&#x60;: declined, &#x60;ec&#x60;: error converting, &#x60;es&#x60;: error sending, &#x60;xp&#x60;: expired
         * @param {string} [who] &#x60;m&#x60;: only me, &#x60;mo&#x60;: me and others, &#x60;o&#x60;: only others
         * @param {string} [format] Export format, can be &#x60;json&#x60; (default), &#x60;csv&#x60;, or &#x60;xls&#x60;
         * @param {number} [signerData] Set to &#x60;1&#x60; to export with each signer on a separate row
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async documentsSearchList(page?: number, limit?: number, q?: string, autocomplete?: string, name?: string, subdomain?: string, signerEmails?: string, status?: string, who?: string, format?: string, signerData?: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse2003>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.documentsSearchList(page, limit, q, autocomplete, name, subdomain, signerEmails, status, who, format, signerData, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * DocumentsSearchApi - factory interface
 * @export
 */
export const DocumentsSearchApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = DocumentsSearchApiFp(configuration)
    return {
        /**
         * Search interface for fast (autocomplete) searching of documents.  This can be useful to have your users search for a document in your interface.  Document names are tokenized on whitespace, hyphens and underscores to also match partial document names.  *Normal search:*  - ?**q**={{query}}  *Autocomplete search:*  - ?**autocomplete**={{partial query}}  *Search in document name:*  - ?**name**={{query}}  *Available (extra) filters:*  - ?**subdomain**={{ team_subdomain }} or use this endpoint with team_subdomain.signrequest.com (when not provided only personal documents are shown) - ?**signer_emails**={{ signer@email.com }} (will filter documents that an email needed to sign/approve) - ?**status**={{ si }} - ?**who**={{ mo }}  To include multiple values for a filter field separate the values with a pipe (|). For example to only search for completed documents use **status=se|vi** (sent and viewed).  *Pagination:*  - ?**page**={{ page_number: default 1 }} - ?**limit**={{ limit results: default 10, max 100 }}  *Format:*  By default json is returned, to export data as csv or xls use the format parameter.  - ?**format**=csv - ?**format**=xls  For csv and xls the data can also be exported with each signer on a separate row. In this mode also the signer inputs that have an *external_id* specified on a tag will be exported. All external_id\'s found will be exported as columns. To use this mode add the **signer_data** parameter.  - ?**format**=csv&**signer_data**=1 - ?**format**=xls&**signer_data**=1  Note that all documents are only ordered by **created** (newest first) when **q**, **autocomplete** or **name** are not used, else they are ordered by the strenght of the match.
         * @summary Search documents
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {string} [q] Normal search query
         * @param {string} [autocomplete] Partial search query
         * @param {string} [name] Document name
         * @param {string} [subdomain] 
         * @param {string} [signerEmails] Email needed to sign/approve
         * @param {string} [status] &#x60;co&#x60;: converting, &#x60;ne&#x60;: new, &#x60;se&#x60;: sent, &#x60;vi&#x60;: viewed, &#x60;si&#x60;: signed, &#x60;do&#x60;: downloaded, &#x60;sd&#x60;: signed and downloaded, &#x60;ca&#x60;: cancelled, &#x60;de&#x60;: declined, &#x60;ec&#x60;: error converting, &#x60;es&#x60;: error sending, &#x60;xp&#x60;: expired
         * @param {string} [who] &#x60;m&#x60;: only me, &#x60;mo&#x60;: me and others, &#x60;o&#x60;: only others
         * @param {string} [format] Export format, can be &#x60;json&#x60; (default), &#x60;csv&#x60;, or &#x60;xls&#x60;
         * @param {number} [signerData] Set to &#x60;1&#x60; to export with each signer on a separate row
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        documentsSearchList(page?: number, limit?: number, q?: string, autocomplete?: string, name?: string, subdomain?: string, signerEmails?: string, status?: string, who?: string, format?: string, signerData?: number, options?: any): AxiosPromise<InlineResponse2003> {
            return localVarFp.documentsSearchList(page, limit, q, autocomplete, name, subdomain, signerEmails, status, who, format, signerData, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * DocumentsSearchApi - object-oriented interface
 * @export
 * @class DocumentsSearchApi
 * @extends {BaseAPI}
 */
export class DocumentsSearchApi extends BaseAPI {
    /**
     * Search interface for fast (autocomplete) searching of documents.  This can be useful to have your users search for a document in your interface.  Document names are tokenized on whitespace, hyphens and underscores to also match partial document names.  *Normal search:*  - ?**q**={{query}}  *Autocomplete search:*  - ?**autocomplete**={{partial query}}  *Search in document name:*  - ?**name**={{query}}  *Available (extra) filters:*  - ?**subdomain**={{ team_subdomain }} or use this endpoint with team_subdomain.signrequest.com (when not provided only personal documents are shown) - ?**signer_emails**={{ signer@email.com }} (will filter documents that an email needed to sign/approve) - ?**status**={{ si }} - ?**who**={{ mo }}  To include multiple values for a filter field separate the values with a pipe (|). For example to only search for completed documents use **status=se|vi** (sent and viewed).  *Pagination:*  - ?**page**={{ page_number: default 1 }} - ?**limit**={{ limit results: default 10, max 100 }}  *Format:*  By default json is returned, to export data as csv or xls use the format parameter.  - ?**format**=csv - ?**format**=xls  For csv and xls the data can also be exported with each signer on a separate row. In this mode also the signer inputs that have an *external_id* specified on a tag will be exported. All external_id\'s found will be exported as columns. To use this mode add the **signer_data** parameter.  - ?**format**=csv&**signer_data**=1 - ?**format**=xls&**signer_data**=1  Note that all documents are only ordered by **created** (newest first) when **q**, **autocomplete** or **name** are not used, else they are ordered by the strenght of the match.
     * @summary Search documents
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [limit] Number of results to return per page.
     * @param {string} [q] Normal search query
     * @param {string} [autocomplete] Partial search query
     * @param {string} [name] Document name
     * @param {string} [subdomain] 
     * @param {string} [signerEmails] Email needed to sign/approve
     * @param {string} [status] &#x60;co&#x60;: converting, &#x60;ne&#x60;: new, &#x60;se&#x60;: sent, &#x60;vi&#x60;: viewed, &#x60;si&#x60;: signed, &#x60;do&#x60;: downloaded, &#x60;sd&#x60;: signed and downloaded, &#x60;ca&#x60;: cancelled, &#x60;de&#x60;: declined, &#x60;ec&#x60;: error converting, &#x60;es&#x60;: error sending, &#x60;xp&#x60;: expired
     * @param {string} [who] &#x60;m&#x60;: only me, &#x60;mo&#x60;: me and others, &#x60;o&#x60;: only others
     * @param {string} [format] Export format, can be &#x60;json&#x60; (default), &#x60;csv&#x60;, or &#x60;xls&#x60;
     * @param {number} [signerData] Set to &#x60;1&#x60; to export with each signer on a separate row
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DocumentsSearchApi
     */
    public documentsSearchList(page?: number, limit?: number, q?: string, autocomplete?: string, name?: string, subdomain?: string, signerEmails?: string, status?: string, who?: string, format?: string, signerData?: number, options?: any) {
        return DocumentsSearchApiFp(this.configuration).documentsSearchList(page, limit, q, autocomplete, name, subdomain, signerEmails, status, who, format, signerData, options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * EventsApi - axios parameter creator
 * @export
 */
export const EventsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Retrieve a list of Events
         * @param {string} [documentUuid] 
         * @param {string} [documentExternalId] 
         * @param {string} [documentSignrequestWho] 
         * @param {string} [documentSignrequestFromEmail] 
         * @param {string} [documentStatus] 
         * @param {string} [documentUserEmail] 
         * @param {string} [documentUserFirstName] 
         * @param {string} [documentUserLastName] 
         * @param {string} [delivered] 
         * @param {string} [deliveredOn] 
         * @param {string} [timestamp] 
         * @param {string} [status] 
         * @param {string} [eventType] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        eventsList: async (documentUuid?: string, documentExternalId?: string, documentSignrequestWho?: string, documentSignrequestFromEmail?: string, documentStatus?: string, documentUserEmail?: string, documentUserFirstName?: string, documentUserLastName?: string, delivered?: string, deliveredOn?: string, timestamp?: string, status?: string, eventType?: string, page?: number, limit?: number, options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/events/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (documentUuid !== undefined) {
                localVarQueryParameter['document__uuid'] = documentUuid;
            }

            if (documentExternalId !== undefined) {
                localVarQueryParameter['document__external_id'] = documentExternalId;
            }

            if (documentSignrequestWho !== undefined) {
                localVarQueryParameter['document__signrequest__who'] = documentSignrequestWho;
            }

            if (documentSignrequestFromEmail !== undefined) {
                localVarQueryParameter['document__signrequest__from_email'] = documentSignrequestFromEmail;
            }

            if (documentStatus !== undefined) {
                localVarQueryParameter['document__status'] = documentStatus;
            }

            if (documentUserEmail !== undefined) {
                localVarQueryParameter['document__user__email'] = documentUserEmail;
            }

            if (documentUserFirstName !== undefined) {
                localVarQueryParameter['document__user__first_name'] = documentUserFirstName;
            }

            if (documentUserLastName !== undefined) {
                localVarQueryParameter['document__user__last_name'] = documentUserLastName;
            }

            if (delivered !== undefined) {
                localVarQueryParameter['delivered'] = delivered;
            }

            if (deliveredOn !== undefined) {
                localVarQueryParameter['delivered_on'] = deliveredOn;
            }

            if (timestamp !== undefined) {
                localVarQueryParameter['timestamp'] = timestamp;
            }

            if (status !== undefined) {
                localVarQueryParameter['status'] = status;
            }

            if (eventType !== undefined) {
                localVarQueryParameter['event_type'] = eventType;
            }

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Retrieve an Event
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        eventsRead: async (uuid: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('eventsRead', 'uuid', uuid)
            const localVarPath = `/events/{uuid}/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * EventsApi - functional programming interface
 * @export
 */
export const EventsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = EventsApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Retrieve a list of Events
         * @param {string} [documentUuid] 
         * @param {string} [documentExternalId] 
         * @param {string} [documentSignrequestWho] 
         * @param {string} [documentSignrequestFromEmail] 
         * @param {string} [documentStatus] 
         * @param {string} [documentUserEmail] 
         * @param {string} [documentUserFirstName] 
         * @param {string} [documentUserLastName] 
         * @param {string} [delivered] 
         * @param {string} [deliveredOn] 
         * @param {string} [timestamp] 
         * @param {string} [status] 
         * @param {string} [eventType] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async eventsList(documentUuid?: string, documentExternalId?: string, documentSignrequestWho?: string, documentSignrequestFromEmail?: string, documentStatus?: string, documentUserEmail?: string, documentUserFirstName?: string, documentUserLastName?: string, delivered?: string, deliveredOn?: string, timestamp?: string, status?: string, eventType?: string, page?: number, limit?: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse2005>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.eventsList(documentUuid, documentExternalId, documentSignrequestWho, documentSignrequestFromEmail, documentStatus, documentUserEmail, documentUserFirstName, documentUserLastName, delivered, deliveredOn, timestamp, status, eventType, page, limit, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Retrieve an Event
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async eventsRead(uuid: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Event>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.eventsRead(uuid, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * EventsApi - factory interface
 * @export
 */
export const EventsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = EventsApiFp(configuration)
    return {
        /**
         * 
         * @summary Retrieve a list of Events
         * @param {string} [documentUuid] 
         * @param {string} [documentExternalId] 
         * @param {string} [documentSignrequestWho] 
         * @param {string} [documentSignrequestFromEmail] 
         * @param {string} [documentStatus] 
         * @param {string} [documentUserEmail] 
         * @param {string} [documentUserFirstName] 
         * @param {string} [documentUserLastName] 
         * @param {string} [delivered] 
         * @param {string} [deliveredOn] 
         * @param {string} [timestamp] 
         * @param {string} [status] 
         * @param {string} [eventType] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        eventsList(documentUuid?: string, documentExternalId?: string, documentSignrequestWho?: string, documentSignrequestFromEmail?: string, documentStatus?: string, documentUserEmail?: string, documentUserFirstName?: string, documentUserLastName?: string, delivered?: string, deliveredOn?: string, timestamp?: string, status?: string, eventType?: string, page?: number, limit?: number, options?: any): AxiosPromise<InlineResponse2005> {
            return localVarFp.eventsList(documentUuid, documentExternalId, documentSignrequestWho, documentSignrequestFromEmail, documentStatus, documentUserEmail, documentUserFirstName, documentUserLastName, delivered, deliveredOn, timestamp, status, eventType, page, limit, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Retrieve an Event
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        eventsRead(uuid: string, options?: any): AxiosPromise<Event> {
            return localVarFp.eventsRead(uuid, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * EventsApi - object-oriented interface
 * @export
 * @class EventsApi
 * @extends {BaseAPI}
 */
export class EventsApi extends BaseAPI {
    /**
     * 
     * @summary Retrieve a list of Events
     * @param {string} [documentUuid] 
     * @param {string} [documentExternalId] 
     * @param {string} [documentSignrequestWho] 
     * @param {string} [documentSignrequestFromEmail] 
     * @param {string} [documentStatus] 
     * @param {string} [documentUserEmail] 
     * @param {string} [documentUserFirstName] 
     * @param {string} [documentUserLastName] 
     * @param {string} [delivered] 
     * @param {string} [deliveredOn] 
     * @param {string} [timestamp] 
     * @param {string} [status] 
     * @param {string} [eventType] 
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [limit] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    public eventsList(documentUuid?: string, documentExternalId?: string, documentSignrequestWho?: string, documentSignrequestFromEmail?: string, documentStatus?: string, documentUserEmail?: string, documentUserFirstName?: string, documentUserLastName?: string, delivered?: string, deliveredOn?: string, timestamp?: string, status?: string, eventType?: string, page?: number, limit?: number, options?: any) {
        return EventsApiFp(this.configuration).eventsList(documentUuid, documentExternalId, documentSignrequestWho, documentSignrequestFromEmail, documentStatus, documentUserEmail, documentUserFirstName, documentUserLastName, delivered, deliveredOn, timestamp, status, eventType, page, limit, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Retrieve an Event
     * @param {string} uuid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    public eventsRead(uuid: string, options?: any) {
        return EventsApiFp(this.configuration).eventsRead(uuid, options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * SignrequestQuickCreateApi - axios parameter creator
 * @export
 */
export const SignrequestQuickCreateApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Quick create a SignRequest
         * @param {SignRequestQuickCreate} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestQuickCreateCreate: async (data: SignRequestQuickCreate, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'data' is not null or undefined
            assertParamExists('signrequestQuickCreateCreate', 'data', data)
            const localVarPath = `/signrequest-quick-create/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(data, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * SignrequestQuickCreateApi - functional programming interface
 * @export
 */
export const SignrequestQuickCreateApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = SignrequestQuickCreateApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Quick create a SignRequest
         * @param {SignRequestQuickCreate} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async signrequestQuickCreateCreate(data: SignRequestQuickCreate, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<SignRequestQuickCreate>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.signrequestQuickCreateCreate(data, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * SignrequestQuickCreateApi - factory interface
 * @export
 */
export const SignrequestQuickCreateApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = SignrequestQuickCreateApiFp(configuration)
    return {
        /**
         * 
         * @summary Quick create a SignRequest
         * @param {SignRequestQuickCreate} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestQuickCreateCreate(data: SignRequestQuickCreate, options?: any): AxiosPromise<SignRequestQuickCreate> {
            return localVarFp.signrequestQuickCreateCreate(data, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * SignrequestQuickCreateApi - object-oriented interface
 * @export
 * @class SignrequestQuickCreateApi
 * @extends {BaseAPI}
 */
export class SignrequestQuickCreateApi extends BaseAPI {
    /**
     * 
     * @summary Quick create a SignRequest
     * @param {SignRequestQuickCreate} data 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SignrequestQuickCreateApi
     */
    public signrequestQuickCreateCreate(data: SignRequestQuickCreate, options?: any) {
        return SignrequestQuickCreateApiFp(this.configuration).signrequestQuickCreateCreate(data, options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * SignrequestsApi - axios parameter creator
 * @export
 */
export const SignrequestsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Cancel a SignRequest
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestsCancelSignrequest: async (uuid: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('signrequestsCancelSignrequest', 'uuid', uuid)
            const localVarPath = `/signrequests/{uuid}/cancel_signrequest/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Create a SignRequest
         * @param {SignRequest} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestsCreate: async (data: SignRequest, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'data' is not null or undefined
            assertParamExists('signrequestsCreate', 'data', data)
            const localVarPath = `/signrequests/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(data, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Forward a SignRequest to a different signer by email
         * @param {string} uuid 
         * @param {ForwardSigner} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestsForwardSigner: async (uuid: string, data: ForwardSigner, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('signrequestsForwardSigner', 'uuid', uuid)
            // verify required parameter 'data' is not null or undefined
            assertParamExists('signrequestsForwardSigner', 'data', data)
            const localVarPath = `/signrequests/{uuid}/forward_signer/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(data, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Retrieve a list of SignRequests
         * @param {string} [who] 
         * @param {string} [fromEmail] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestsList: async (who?: string, fromEmail?: string, page?: number, limit?: number, options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/signrequests/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (who !== undefined) {
                localVarQueryParameter['who'] = who;
            }

            if (fromEmail !== undefined) {
                localVarQueryParameter['from_email'] = fromEmail;
            }

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Retrieve a SignRequest
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestsRead: async (uuid: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('signrequestsRead', 'uuid', uuid)
            const localVarPath = `/signrequests/{uuid}/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Resend a SignRequest
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestsResendSignrequestEmail: async (uuid: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('signrequestsResendSignrequestEmail', 'uuid', uuid)
            const localVarPath = `/signrequests/{uuid}/resend_signrequest_email/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * SignrequestsApi - functional programming interface
 * @export
 */
export const SignrequestsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = SignrequestsApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Cancel a SignRequest
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async signrequestsCancelSignrequest(uuid: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse201>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.signrequestsCancelSignrequest(uuid, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Create a SignRequest
         * @param {SignRequest} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async signrequestsCreate(data: SignRequest, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<SignRequest>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.signrequestsCreate(data, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Forward a SignRequest to a different signer by email
         * @param {string} uuid 
         * @param {ForwardSigner} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async signrequestsForwardSigner(uuid: string, data: ForwardSigner, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<SignRequest>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.signrequestsForwardSigner(uuid, data, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Retrieve a list of SignRequests
         * @param {string} [who] 
         * @param {string} [fromEmail] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async signrequestsList(who?: string, fromEmail?: string, page?: number, limit?: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse2006>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.signrequestsList(who, fromEmail, page, limit, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Retrieve a SignRequest
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async signrequestsRead(uuid: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<SignRequest>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.signrequestsRead(uuid, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Resend a SignRequest
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async signrequestsResendSignrequestEmail(uuid: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse2011>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.signrequestsResendSignrequestEmail(uuid, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * SignrequestsApi - factory interface
 * @export
 */
export const SignrequestsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = SignrequestsApiFp(configuration)
    return {
        /**
         * 
         * @summary Cancel a SignRequest
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestsCancelSignrequest(uuid: string, options?: any): AxiosPromise<InlineResponse201> {
            return localVarFp.signrequestsCancelSignrequest(uuid, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Create a SignRequest
         * @param {SignRequest} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestsCreate(data: SignRequest, options?: any): AxiosPromise<SignRequest> {
            return localVarFp.signrequestsCreate(data, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Forward a SignRequest to a different signer by email
         * @param {string} uuid 
         * @param {ForwardSigner} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestsForwardSigner(uuid: string, data: ForwardSigner, options?: any): AxiosPromise<SignRequest> {
            return localVarFp.signrequestsForwardSigner(uuid, data, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Retrieve a list of SignRequests
         * @param {string} [who] 
         * @param {string} [fromEmail] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestsList(who?: string, fromEmail?: string, page?: number, limit?: number, options?: any): AxiosPromise<InlineResponse2006> {
            return localVarFp.signrequestsList(who, fromEmail, page, limit, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Retrieve a SignRequest
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestsRead(uuid: string, options?: any): AxiosPromise<SignRequest> {
            return localVarFp.signrequestsRead(uuid, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Resend a SignRequest
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signrequestsResendSignrequestEmail(uuid: string, options?: any): AxiosPromise<InlineResponse2011> {
            return localVarFp.signrequestsResendSignrequestEmail(uuid, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * SignrequestsApi - object-oriented interface
 * @export
 * @class SignrequestsApi
 * @extends {BaseAPI}
 */
export class SignrequestsApi extends BaseAPI {
    /**
     * 
     * @summary Cancel a SignRequest
     * @param {string} uuid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SignrequestsApi
     */
    public signrequestsCancelSignrequest(uuid: string, options?: any) {
        return SignrequestsApiFp(this.configuration).signrequestsCancelSignrequest(uuid, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Create a SignRequest
     * @param {SignRequest} data 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SignrequestsApi
     */
    public signrequestsCreate(data: SignRequest, options?: any) {
        return SignrequestsApiFp(this.configuration).signrequestsCreate(data, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Forward a SignRequest to a different signer by email
     * @param {string} uuid 
     * @param {ForwardSigner} data 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SignrequestsApi
     */
    public signrequestsForwardSigner(uuid: string, data: ForwardSigner, options?: any) {
        return SignrequestsApiFp(this.configuration).signrequestsForwardSigner(uuid, data, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Retrieve a list of SignRequests
     * @param {string} [who] 
     * @param {string} [fromEmail] 
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [limit] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SignrequestsApi
     */
    public signrequestsList(who?: string, fromEmail?: string, page?: number, limit?: number, options?: any) {
        return SignrequestsApiFp(this.configuration).signrequestsList(who, fromEmail, page, limit, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Retrieve a SignRequest
     * @param {string} uuid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SignrequestsApi
     */
    public signrequestsRead(uuid: string, options?: any) {
        return SignrequestsApiFp(this.configuration).signrequestsRead(uuid, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Resend a SignRequest
     * @param {string} uuid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SignrequestsApi
     */
    public signrequestsResendSignrequestEmail(uuid: string, options?: any) {
        return SignrequestsApiFp(this.configuration).signrequestsResendSignrequestEmail(uuid, options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * TeamMembersApi - axios parameter creator
 * @export
 */
export const TeamMembersApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Retrieve a list of Team Members
         * @param {string} [isActive] 
         * @param {string} [isOwner] 
         * @param {string} [isAdmin] 
         * @param {string} [userEmail] 
         * @param {string} [userFirstName] 
         * @param {string} [userLastName] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamMembersList: async (isActive?: string, isOwner?: string, isAdmin?: string, userEmail?: string, userFirstName?: string, userLastName?: string, page?: number, limit?: number, options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/team-members/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (isActive !== undefined) {
                localVarQueryParameter['is_active'] = isActive;
            }

            if (isOwner !== undefined) {
                localVarQueryParameter['is_owner'] = isOwner;
            }

            if (isAdmin !== undefined) {
                localVarQueryParameter['is_admin'] = isAdmin;
            }

            if (userEmail !== undefined) {
                localVarQueryParameter['user__email'] = userEmail;
            }

            if (userFirstName !== undefined) {
                localVarQueryParameter['user__first_name'] = userFirstName;
            }

            if (userLastName !== undefined) {
                localVarQueryParameter['user__last_name'] = userLastName;
            }

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Retrieve a Team Member
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamMembersRead: async (uuid: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('teamMembersRead', 'uuid', uuid)
            const localVarPath = `/team-members/{uuid}/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * TeamMembersApi - functional programming interface
 * @export
 */
export const TeamMembersApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = TeamMembersApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Retrieve a list of Team Members
         * @param {string} [isActive] 
         * @param {string} [isOwner] 
         * @param {string} [isAdmin] 
         * @param {string} [userEmail] 
         * @param {string} [userFirstName] 
         * @param {string} [userLastName] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async teamMembersList(isActive?: string, isOwner?: string, isAdmin?: string, userEmail?: string, userFirstName?: string, userLastName?: string, page?: number, limit?: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse2007>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.teamMembersList(isActive, isOwner, isAdmin, userEmail, userFirstName, userLastName, page, limit, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Retrieve a Team Member
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async teamMembersRead(uuid: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<TeamMember>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.teamMembersRead(uuid, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * TeamMembersApi - factory interface
 * @export
 */
export const TeamMembersApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = TeamMembersApiFp(configuration)
    return {
        /**
         * 
         * @summary Retrieve a list of Team Members
         * @param {string} [isActive] 
         * @param {string} [isOwner] 
         * @param {string} [isAdmin] 
         * @param {string} [userEmail] 
         * @param {string} [userFirstName] 
         * @param {string} [userLastName] 
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamMembersList(isActive?: string, isOwner?: string, isAdmin?: string, userEmail?: string, userFirstName?: string, userLastName?: string, page?: number, limit?: number, options?: any): AxiosPromise<InlineResponse2007> {
            return localVarFp.teamMembersList(isActive, isOwner, isAdmin, userEmail, userFirstName, userLastName, page, limit, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Retrieve a Team Member
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamMembersRead(uuid: string, options?: any): AxiosPromise<TeamMember> {
            return localVarFp.teamMembersRead(uuid, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * TeamMembersApi - object-oriented interface
 * @export
 * @class TeamMembersApi
 * @extends {BaseAPI}
 */
export class TeamMembersApi extends BaseAPI {
    /**
     * 
     * @summary Retrieve a list of Team Members
     * @param {string} [isActive] 
     * @param {string} [isOwner] 
     * @param {string} [isAdmin] 
     * @param {string} [userEmail] 
     * @param {string} [userFirstName] 
     * @param {string} [userLastName] 
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [limit] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TeamMembersApi
     */
    public teamMembersList(isActive?: string, isOwner?: string, isAdmin?: string, userEmail?: string, userFirstName?: string, userLastName?: string, page?: number, limit?: number, options?: any) {
        return TeamMembersApiFp(this.configuration).teamMembersList(isActive, isOwner, isAdmin, userEmail, userFirstName, userLastName, page, limit, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Retrieve a Team Member
     * @param {string} uuid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TeamMembersApi
     */
    public teamMembersRead(uuid: string, options?: any) {
        return TeamMembersApiFp(this.configuration).teamMembersRead(uuid, options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * TeamsApi - axios parameter creator
 * @export
 */
export const TeamsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Create a Team
         * @param {Team} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamsCreate: async (data: Team, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'data' is not null or undefined
            assertParamExists('teamsCreate', 'data', data)
            const localVarPath = `/teams/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(data, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Delete a Team
         * @param {string} subdomain 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamsDelete: async (subdomain: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'subdomain' is not null or undefined
            assertParamExists('teamsDelete', 'subdomain', subdomain)
            const localVarPath = `/teams/{subdomain}/`
                .replace(`{${"subdomain"}}`, encodeURIComponent(String(subdomain)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'DELETE', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Invite a Team Member
         * @param {string} subdomain 
         * @param {InviteMember} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamsInviteMember: async (subdomain: string, data: InviteMember, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'subdomain' is not null or undefined
            assertParamExists('teamsInviteMember', 'subdomain', subdomain)
            // verify required parameter 'data' is not null or undefined
            assertParamExists('teamsInviteMember', 'data', data)
            const localVarPath = `/teams/{subdomain}/invite_member/`
                .replace(`{${"subdomain"}}`, encodeURIComponent(String(subdomain)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(data, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Retrieve a list of Teams
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamsList: async (page?: number, limit?: number, options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/teams/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Update a Team
         * @param {string} subdomain 
         * @param {Team} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamsPartialUpdate: async (subdomain: string, data: Team, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'subdomain' is not null or undefined
            assertParamExists('teamsPartialUpdate', 'subdomain', subdomain)
            // verify required parameter 'data' is not null or undefined
            assertParamExists('teamsPartialUpdate', 'data', data)
            const localVarPath = `/teams/{subdomain}/`
                .replace(`{${"subdomain"}}`, encodeURIComponent(String(subdomain)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'PATCH', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(data, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Retrieve a Team
         * @param {string} subdomain 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamsRead: async (subdomain: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'subdomain' is not null or undefined
            assertParamExists('teamsRead', 'subdomain', subdomain)
            const localVarPath = `/teams/{subdomain}/`
                .replace(`{${"subdomain"}}`, encodeURIComponent(String(subdomain)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * TeamsApi - functional programming interface
 * @export
 */
export const TeamsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = TeamsApiAxiosParamCreator(configuration)
    return {
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Create a Team
         * @param {Team} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async teamsCreate(data: Team, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Team>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.teamsCreate(data, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Delete a Team
         * @param {string} subdomain 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async teamsDelete(subdomain: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.teamsDelete(subdomain, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Invite a Team Member
         * @param {string} subdomain 
         * @param {InviteMember} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async teamsInviteMember(subdomain: string, data: InviteMember, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InviteMember>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.teamsInviteMember(subdomain, data, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Retrieve a list of Teams
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async teamsList(page?: number, limit?: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse2008>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.teamsList(page, limit, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Update a Team
         * @param {string} subdomain 
         * @param {Team} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async teamsPartialUpdate(subdomain: string, data: Team, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Team>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.teamsPartialUpdate(subdomain, data, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Retrieve a Team
         * @param {string} subdomain 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async teamsRead(subdomain: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Team>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.teamsRead(subdomain, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * TeamsApi - factory interface
 * @export
 */
export const TeamsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = TeamsApiFp(configuration)
    return {
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Create a Team
         * @param {Team} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamsCreate(data: Team, options?: any): AxiosPromise<Team> {
            return localVarFp.teamsCreate(data, options).then((request) => request(axios, basePath));
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Delete a Team
         * @param {string} subdomain 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamsDelete(subdomain: string, options?: any): AxiosPromise<void> {
            return localVarFp.teamsDelete(subdomain, options).then((request) => request(axios, basePath));
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Invite a Team Member
         * @param {string} subdomain 
         * @param {InviteMember} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamsInviteMember(subdomain: string, data: InviteMember, options?: any): AxiosPromise<InviteMember> {
            return localVarFp.teamsInviteMember(subdomain, data, options).then((request) => request(axios, basePath));
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Retrieve a list of Teams
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamsList(page?: number, limit?: number, options?: any): AxiosPromise<InlineResponse2008> {
            return localVarFp.teamsList(page, limit, options).then((request) => request(axios, basePath));
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Update a Team
         * @param {string} subdomain 
         * @param {Team} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamsPartialUpdate(subdomain: string, data: Team, options?: any): AxiosPromise<Team> {
            return localVarFp.teamsPartialUpdate(subdomain, data, options).then((request) => request(axios, basePath));
        },
        /**
         * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
         * @summary Retrieve a Team
         * @param {string} subdomain 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        teamsRead(subdomain: string, options?: any): AxiosPromise<Team> {
            return localVarFp.teamsRead(subdomain, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * TeamsApi - object-oriented interface
 * @export
 * @class TeamsApi
 * @extends {BaseAPI}
 */
export class TeamsApi extends BaseAPI {
    /**
     * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
     * @summary Create a Team
     * @param {Team} data 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TeamsApi
     */
    public teamsCreate(data: Team, options?: any) {
        return TeamsApiFp(this.configuration).teamsCreate(data, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
     * @summary Delete a Team
     * @param {string} subdomain 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TeamsApi
     */
    public teamsDelete(subdomain: string, options?: any) {
        return TeamsApiFp(this.configuration).teamsDelete(subdomain, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
     * @summary Invite a Team Member
     * @param {string} subdomain 
     * @param {InviteMember} data 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TeamsApi
     */
    public teamsInviteMember(subdomain: string, data: InviteMember, options?: any) {
        return TeamsApiFp(this.configuration).teamsInviteMember(subdomain, data, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
     * @summary Retrieve a list of Teams
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [limit] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TeamsApi
     */
    public teamsList(page?: number, limit?: number, options?: any) {
        return TeamsApiFp(this.configuration).teamsList(page, limit, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
     * @summary Update a Team
     * @param {string} subdomain 
     * @param {Team} data 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TeamsApi
     */
    public teamsPartialUpdate(subdomain: string, data: Team, options?: any) {
        return TeamsApiFp(this.configuration).teamsPartialUpdate(subdomain, data, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Required fields are **name** and **subdomain** where the subdomain is globally unique. Use **POST** to create a Team. To update a field on a Team use **PATCH**.  To use the API on behalf of a particular team change the endpoint to: *https://_**{{ subdomain }}**.signrequest.com/api/v1/...*  To invite new team members you can use **POST** {\"email\":\"**email-of-member-to-invite@example.com**\",\"is_admin\":false,\"is_owner\":false} to: *https://signrequest.com/api/v1/teams/_**{{ subdomain }}**_/invite_member/_*
     * @summary Retrieve a Team
     * @param {string} subdomain 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TeamsApi
     */
    public teamsRead(subdomain: string, options?: any) {
        return TeamsApiFp(this.configuration).teamsRead(subdomain, options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * TemplatesApi - axios parameter creator
 * @export
 */
export const TemplatesApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Retrieve a list of Templates
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        templatesList: async (page?: number, limit?: number, options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/templates/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Retrieve a Template
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        templatesRead: async (uuid: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('templatesRead', 'uuid', uuid)
            const localVarPath = `/templates/{uuid}/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * TemplatesApi - functional programming interface
 * @export
 */
export const TemplatesApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = TemplatesApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Retrieve a list of Templates
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async templatesList(page?: number, limit?: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse2009>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.templatesList(page, limit, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Retrieve a Template
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async templatesRead(uuid: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Template>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.templatesRead(uuid, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * TemplatesApi - factory interface
 * @export
 */
export const TemplatesApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = TemplatesApiFp(configuration)
    return {
        /**
         * 
         * @summary Retrieve a list of Templates
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        templatesList(page?: number, limit?: number, options?: any): AxiosPromise<InlineResponse2009> {
            return localVarFp.templatesList(page, limit, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Retrieve a Template
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        templatesRead(uuid: string, options?: any): AxiosPromise<Template> {
            return localVarFp.templatesRead(uuid, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * TemplatesApi - object-oriented interface
 * @export
 * @class TemplatesApi
 * @extends {BaseAPI}
 */
export class TemplatesApi extends BaseAPI {
    /**
     * 
     * @summary Retrieve a list of Templates
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [limit] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TemplatesApi
     */
    public templatesList(page?: number, limit?: number, options?: any) {
        return TemplatesApiFp(this.configuration).templatesList(page, limit, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Retrieve a Template
     * @param {string} uuid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TemplatesApi
     */
    public templatesRead(uuid: string, options?: any) {
        return TemplatesApiFp(this.configuration).templatesRead(uuid, options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * WebhooksApi - axios parameter creator
 * @export
 */
export const WebhooksApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Create a Webhook
         * @param {WebhookSubscription} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        webhooksCreate: async (data: WebhookSubscription, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'data' is not null or undefined
            assertParamExists('webhooksCreate', 'data', data)
            const localVarPath = `/webhooks/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(data, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Delete a Webhook
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        webhooksDelete: async (uuid: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('webhooksDelete', 'uuid', uuid)
            const localVarPath = `/webhooks/{uuid}/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'DELETE', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Retrieve a list of Webhooks
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        webhooksList: async (page?: number, limit?: number, options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/webhooks/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Partially update a Webhook
         * @param {string} uuid 
         * @param {WebhookSubscription} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        webhooksPartialUpdate: async (uuid: string, data: WebhookSubscription, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('webhooksPartialUpdate', 'uuid', uuid)
            // verify required parameter 'data' is not null or undefined
            assertParamExists('webhooksPartialUpdate', 'data', data)
            const localVarPath = `/webhooks/{uuid}/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'PATCH', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(data, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Retrieve a Webhook
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        webhooksRead: async (uuid: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('webhooksRead', 'uuid', uuid)
            const localVarPath = `/webhooks/{uuid}/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Update a Webhook
         * @param {string} uuid 
         * @param {WebhookSubscription} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        webhooksUpdate: async (uuid: string, data: WebhookSubscription, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'uuid' is not null or undefined
            assertParamExists('webhooksUpdate', 'uuid', uuid)
            // verify required parameter 'data' is not null or undefined
            assertParamExists('webhooksUpdate', 'data', data)
            const localVarPath = `/webhooks/{uuid}/`
                .replace(`{${"uuid"}}`, encodeURIComponent(String(uuid)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'PUT', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Token required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(data, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * WebhooksApi - functional programming interface
 * @export
 */
export const WebhooksApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = WebhooksApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Create a Webhook
         * @param {WebhookSubscription} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async webhooksCreate(data: WebhookSubscription, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<WebhookSubscription>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.webhooksCreate(data, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Delete a Webhook
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async webhooksDelete(uuid: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.webhooksDelete(uuid, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Retrieve a list of Webhooks
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async webhooksList(page?: number, limit?: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<InlineResponse20010>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.webhooksList(page, limit, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Partially update a Webhook
         * @param {string} uuid 
         * @param {WebhookSubscription} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async webhooksPartialUpdate(uuid: string, data: WebhookSubscription, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<WebhookSubscription>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.webhooksPartialUpdate(uuid, data, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Retrieve a Webhook
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async webhooksRead(uuid: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<WebhookSubscription>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.webhooksRead(uuid, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Update a Webhook
         * @param {string} uuid 
         * @param {WebhookSubscription} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async webhooksUpdate(uuid: string, data: WebhookSubscription, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<WebhookSubscription>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.webhooksUpdate(uuid, data, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * WebhooksApi - factory interface
 * @export
 */
export const WebhooksApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = WebhooksApiFp(configuration)
    return {
        /**
         * 
         * @summary Create a Webhook
         * @param {WebhookSubscription} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        webhooksCreate(data: WebhookSubscription, options?: any): AxiosPromise<WebhookSubscription> {
            return localVarFp.webhooksCreate(data, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Delete a Webhook
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        webhooksDelete(uuid: string, options?: any): AxiosPromise<void> {
            return localVarFp.webhooksDelete(uuid, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Retrieve a list of Webhooks
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [limit] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        webhooksList(page?: number, limit?: number, options?: any): AxiosPromise<InlineResponse20010> {
            return localVarFp.webhooksList(page, limit, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Partially update a Webhook
         * @param {string} uuid 
         * @param {WebhookSubscription} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        webhooksPartialUpdate(uuid: string, data: WebhookSubscription, options?: any): AxiosPromise<WebhookSubscription> {
            return localVarFp.webhooksPartialUpdate(uuid, data, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Retrieve a Webhook
         * @param {string} uuid 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        webhooksRead(uuid: string, options?: any): AxiosPromise<WebhookSubscription> {
            return localVarFp.webhooksRead(uuid, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Update a Webhook
         * @param {string} uuid 
         * @param {WebhookSubscription} data 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        webhooksUpdate(uuid: string, data: WebhookSubscription, options?: any): AxiosPromise<WebhookSubscription> {
            return localVarFp.webhooksUpdate(uuid, data, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * WebhooksApi - object-oriented interface
 * @export
 * @class WebhooksApi
 * @extends {BaseAPI}
 */
export class WebhooksApi extends BaseAPI {
    /**
     * 
     * @summary Create a Webhook
     * @param {WebhookSubscription} data 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WebhooksApi
     */
    public webhooksCreate(data: WebhookSubscription, options?: any) {
        return WebhooksApiFp(this.configuration).webhooksCreate(data, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Delete a Webhook
     * @param {string} uuid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WebhooksApi
     */
    public webhooksDelete(uuid: string, options?: any) {
        return WebhooksApiFp(this.configuration).webhooksDelete(uuid, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Retrieve a list of Webhooks
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [limit] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WebhooksApi
     */
    public webhooksList(page?: number, limit?: number, options?: any) {
        return WebhooksApiFp(this.configuration).webhooksList(page, limit, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Partially update a Webhook
     * @param {string} uuid 
     * @param {WebhookSubscription} data 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WebhooksApi
     */
    public webhooksPartialUpdate(uuid: string, data: WebhookSubscription, options?: any) {
        return WebhooksApiFp(this.configuration).webhooksPartialUpdate(uuid, data, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Retrieve a Webhook
     * @param {string} uuid 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WebhooksApi
     */
    public webhooksRead(uuid: string, options?: any) {
        return WebhooksApiFp(this.configuration).webhooksRead(uuid, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Update a Webhook
     * @param {string} uuid 
     * @param {WebhookSubscription} data 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WebhooksApi
     */
    public webhooksUpdate(uuid: string, data: WebhookSubscription, options?: any) {
        return WebhooksApiFp(this.configuration).webhooksUpdate(uuid, data, options).then((request) => request(this.axios, this.basePath));
    }
}


