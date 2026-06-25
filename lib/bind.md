https://developers.bind.com.mx/api-details#api=bind-erp-api&operation=Services_GetServices

// Puede ser llamada con POST(create) y PUT(update)
| Campo                | Requerido | Tipo         |
|---------------------|-----------|--------------|
| Code                | true      | string       |
| Title               | true      | string       |
| CurrencyID          | true      | string (uuid)|
| SATCompanyAccountID | true      | string (uuid)|
| MeasurementUnit     | true      | string       |
| Description         | false     | string       |
| Category1ID         | false     | string (uuid)|
| Category2ID         | false     | string (uuid)|
| Category3ID         | false     | string (uuid)|
| VariableConcept     | false     | boolean      |
| ChargeVAT           | false     | boolean      |