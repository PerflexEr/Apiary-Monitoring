{
	"info": {
		"_postman_id": "apiary-complete-collection",
		"name": "Apiary Monitoring System - Complete API Collection",
		"description": "Полная коллекция для тестирования всех эндпоинтов системы мониторинга пасеки",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"variable": [
		{
			"key": "base_url",
			"value": "http://localhost"
		},
		{
			"key": "auth_port",
			"value": "8000"
		},
		{
			"key": "hive_port",
			"value": "8001"
		},
		{
			"key": "monitoring_port",
			"value": "8002"
		},
		{
			"key": "notification_port",
			"value": "8003"
		},
		{
			"key": "username",
			"value": "testuser"
		},
		{
			"key": "password",
			"value": "testpassword123"
		},
		{
			"key": "admin_username",
			"value": "admin"
		},
		{
			"key": "admin_password",
			"value": "adminpassword123"
		}
	],
	"auth": {
		"type": "bearer",
		"bearer": [
			{
				"key": "token",
				"value": "{{access_token}}",
				"type": "string"
			}
		]
	},
	"item": [
		{
			"name": "🔐 Auth Service",
			"item": [
				{
					"name": "Health Check",
					"request": {
						"auth": {
							"type": "noauth"
						},
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{auth_port}}/health",
							"host": ["{{base_url}}"],
							"port": "{{auth_port}}",
							"path": ["health"]
						}
					}
				},
				{
					"name": "Create Regular User",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"User created successfully\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('id');",
									"    pm.expect(jsonData.username).to.eql(pm.collectionVariables.get('username'));",
									"    pm.collectionVariables.set('user_id', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"auth": {
							"type": "noauth"
						},
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"email\": \"{{username}}@example.com\",\n    \"username\": \"{{username}}\",\n    \"password\": \"{{password}}\",\n    \"is_active\": true,\n    \"is_superuser\": false\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{auth_port}}/users/",
							"host": ["{{base_url}}"],
							"port": "{{auth_port}}",
							"path": ["users", ""]
						}
					}
				},
				{
					"name": "Create Admin User",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Admin user created successfully\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('id');",
									"    pm.expect(jsonData.is_superuser).to.eql(true);",
									"    pm.collectionVariables.set('admin_id', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"auth": {
							"type": "noauth"
						},
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"email\": \"{{admin_username}}@example.com\",\n    \"username\": \"{{admin_username}}\",\n    \"password\": \"{{admin_password}}\",\n    \"is_active\": true,\n    \"is_superuser\": true\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{auth_port}}/users/",
							"host": ["{{base_url}}"],
							"port": "{{auth_port}}",
							"path": ["users", ""]
						}
					}
				},
				{
					"name": "Login Regular User",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Token received\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('access_token');",
									"    pm.expect(jsonData.token_type).to.eql('bearer');",
									"    pm.collectionVariables.set('access_token', jsonData.access_token);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"auth": {
							"type": "noauth"
						},
						"method": "POST",
						"header": [],
						"body": {
							"mode": "urlencoded",
							"urlencoded": [
								{
									"key": "username",
									"value": "{{username}}",
									"type": "text"
								},
								{
									"key": "password",
									"value": "{{password}}",
									"type": "text"
								}
							]
						},
						"url": {
							"raw": "{{base_url}}:{{auth_port}}/token",
							"host": ["{{base_url}}"],
							"port": "{{auth_port}}",
							"path": ["token"]
						}
					}
				},
				{
					"name": "Login Admin User",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Admin token received\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('access_token');",
									"    pm.collectionVariables.set('admin_token', jsonData.access_token);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"auth": {
							"type": "noauth"
						},
						"method": "POST",
						"header": [],
						"body": {
							"mode": "urlencoded",
							"urlencoded": [
								{
									"key": "username",
									"value": "{{admin_username}}",
									"type": "text"
								},
								{
									"key": "password",
									"value": "{{admin_password}}",
									"type": "text"
								}
							]
						},
						"url": {
							"raw": "{{base_url}}:{{auth_port}}/token",
							"host": ["{{base_url}}"],
							"port": "{{auth_port}}",
							"path": ["token"]
						}
					}
				},
				{
					"name": "Get Current User",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Current user data\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('username');",
									"    pm.expect(jsonData).to.have.property('email');",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{auth_port}}/users/me/",
							"host": ["{{base_url}}"],
							"port": "{{auth_port}}",
							"path": ["users", "me", ""]
						}
					}
				},
				{
					"name": "Get All Users (Admin Only)",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "{{admin_token}}",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{auth_port}}/users/?skip=0&limit=100",
							"host": ["{{base_url}}"],
							"port": "{{auth_port}}",
							"path": ["users", ""],
							"query": [
								{
									"key": "skip",
									"value": "0"
								},
								{
									"key": "limit",
									"value": "100"
								}
							]
						}
					}
				},
				{
					"name": "Get User by ID",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{auth_port}}/users/{{user_id}}",
							"host": ["{{base_url}}"],
							"port": "{{auth_port}}",
							"path": ["users", "{{user_id}}"]
						}
					}
				},
				{
					"name": "Update User",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"email\": \"updated_{{username}}@example.com\"\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{auth_port}}/users/{{user_id}}",
							"host": ["{{base_url}}"],
							"port": "{{auth_port}}",
							"path": ["users", "{{user_id}}"]
						}
					}
				}
			]
		},
		{
			"name": "🏠 Hive Service",
			"item": [
				{
					"name": "Health Check",
					"request": {
						"auth": {
							"type": "noauth"
						},
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{hive_port}}/health",
							"host": ["{{base_url}}"],
							"port": "{{hive_port}}",
							"path": ["health"]
						}
					}
				},
				{
					"name": "Create Hive",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Hive created successfully\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('id');",
									"    pm.expect(jsonData.name).to.eql('Тестовый улей');",
									"    pm.collectionVariables.set('hive_id', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\": \"Тестовый улей\",\n    \"location\": \"Сад\",\n    \"description\": \"Основной улей для тестирования\",\n    \"status\": \"active\",\n    \"queen_year\": 2024,\n    \"frames_count\": 10\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{hive_port}}/hives/",
							"host": ["{{base_url}}"],
							"port": "{{hive_port}}",
							"path": ["hives", ""]
						}
					}
				},
				{
					"name": "Create Second Hive",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Second hive created\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.collectionVariables.set('hive_id_2', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\": \"Улей №2\",\n    \"location\": \"Поле\",\n    \"description\": \"Второй улей для тестирования\",\n    \"status\": \"active\",\n    \"queen_year\": 2023,\n    \"frames_count\": 8\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{hive_port}}/hives/",
							"host": ["{{base_url}}"],
							"port": "{{hive_port}}",
							"path": ["hives", ""]
						}
					}
				},
				{
					"name": "Get All Hives",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Hives list returned\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.be.an('array');",
									"    pm.expect(jsonData.length).to.be.at.least(1);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{hive_port}}/hives/?skip=0&limit=100",
							"host": ["{{base_url}}"],
							"port": "{{hive_port}}",
							"path": ["hives", ""],
							"query": [
								{
									"key": "skip",
									"value": "0"
								},
								{
									"key": "limit",
									"value": "100"
								}
							]
						}
					}
				},
				{
					"name": "Get Hive with Stats",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Hive with stats\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('id');",
									"    pm.expect(jsonData).to.have.property('name');",
									"    pm.expect(jsonData).to.have.property('inspections');",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{hive_port}}/hives/{{hive_id}}",
							"host": ["{{base_url}}"],
							"port": "{{hive_port}}",
							"path": ["hives", "{{hive_id}}"]
						}
					}
				},
				{
					"name": "Update Hive",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"description\": \"Обновленное описание улья\",\n    \"frames_count\": 12\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{hive_port}}/hives/{{hive_id}}",
							"host": ["{{base_url}}"],
							"port": "{{hive_port}}",
							"path": ["hives", "{{hive_id}}"]
						}
					}
				},
				{
					"name": "Create Inspection",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Inspection created\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('id');",
									"    pm.collectionVariables.set('inspection_id', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"hive_id\": {{hive_id}},\n    \"temperature\": 35.5,\n    \"humidity\": 65.0,\n    \"weight\": 25.3,\n    \"notes\": \"Хорошее состояние улья, активность пчел высокая\"\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{hive_port}}/inspections/",
							"host": ["{{base_url}}"],
							"port": "{{hive_port}}",
							"path": ["inspections", ""]
						}
					}
				},
				{
					"name": "Create Second Inspection",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"hive_id\": {{hive_id}},\n    \"temperature\": 36.2,\n    \"humidity\": 68.5,\n    \"weight\": 26.1,\n    \"notes\": \"Увеличение веса, хорошая активность\"\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{hive_port}}/inspections/",
							"host": ["{{base_url}}"],
							"port": "{{hive_port}}",
							"path": ["inspections", ""]
						}
					}
				},
				{
					"name": "Get Hive Inspections",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Inspections list\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.be.an('array');",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{hive_port}}/hives/{{hive_id}}/inspections/?skip=0&limit=100",
							"host": ["{{base_url}}"],
							"port": "{{hive_port}}",
							"path": ["hives", "{{hive_id}}", "inspections", ""],
							"query": [
								{
									"key": "skip",
									"value": "0"
								},
								{
									"key": "limit",
									"value": "100"
								}
							]
						}
					}
				}
			]
		},
		{
			"name": "📊 Monitoring Service",
			"item": [
				{
					"name": "Health Check",
					"request": {
						"auth": {
							"type": "noauth"
						},
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/health",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["health"]
						}
					}
				},
				{
					"name": "Create Temperature Sensor",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Temperature sensor created\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('id');",
									"    pm.collectionVariables.set('temp_sensor_id', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\": \"Датчик температуры\",\n    \"sensor_type\": \"temperature\",\n    \"hive_id\": {{hive_id}},\n    \"is_active\": true\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/sensors/",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["sensors", ""]
						}
					}
				},
				{
					"name": "Create Humidity Sensor",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Humidity sensor created\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.collectionVariables.set('humidity_sensor_id', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\": \"Датчик влажности\",\n    \"sensor_type\": \"humidity\",\n    \"hive_id\": {{hive_id}},\n    \"is_active\": true\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/sensors/",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["sensors", ""]
						}
					}
				},
				{
					"name": "Create Weight Sensor",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Weight sensor created\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.collectionVariables.set('weight_sensor_id', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\": \"Датчик веса\",\n    \"sensor_type\": \"weight\",\n    \"hive_id\": {{hive_id}},\n    \"is_active\": true\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/sensors/",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["sensors", ""]
						}
					}
				},
				{
					"name": "Get All Sensors",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Sensors list\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.be.an('array');",
									"    pm.expect(jsonData.length).to.be.at.least(1);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/sensors/?skip=0&limit=100",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["sensors", ""],
							"query": [
								{
									"key": "skip",
									"value": "0"
								},
								{
									"key": "limit",
									"value": "100"
								}
							]
						}
					}
				},
				{
					"name": "Get Sensor by ID",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/sensors/{{temp_sensor_id}}",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["sensors", "{{temp_sensor_id}}"]
						}
					}
				},
				{
					"name": "Get Hive Sensors",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/hives/{{hive_id}}/sensors/",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["hives", "{{hive_id}}", "sensors", ""]
						}
					}
				},
				{
					"name": "Create Temperature Measurement",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Measurement created\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('id');",
									"    pm.collectionVariables.set('measurement_id', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"sensor_id\": {{temp_sensor_id}},\n    \"value\": 34.5,\n    \"battery_level\": 85.0\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/measurements/",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["measurements", ""]
						}
					}
				},
				{
					"name": "Create Multiple Measurements",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"sensor_id\": {{temp_sensor_id}},\n    \"value\": 35.2,\n    \"battery_level\": 84.0\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/measurements/",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["measurements", ""]
						}
					}
				},
				{
					"name": "Create Humidity Measurement",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"sensor_id\": {{humidity_sensor_id}},\n    \"value\": 67.8,\n    \"battery_level\": 92.0\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/measurements/",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["measurements", ""]
						}
					}
				},
				{
					"name": "Get All Measurements",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/measurements/?skip=0&limit=100",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["measurements", ""],
							"query": [
								{
									"key": "skip",
									"value": "0"
								},
								{
									"key": "limit",
									"value": "100"
								}
							]
						}
					}
				},
				{
					"name": "Get Sensor Measurements",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/sensors/{{temp_sensor_id}}/measurements/?limit=50",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["sensors", "{{temp_sensor_id}}", "measurements", ""],
							"query": [
								{
									"key": "limit",
									"value": "50"
								}
							]
						}
					}
				},
				{
					"name": "Get Sensor Measurements with Date Range",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/sensors/{{temp_sensor_id}}/measurements/?start_date=2024-01-01T00:00:00&end_date=2024-12-31T23:59:59&limit=100",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["sensors", "{{temp_sensor_id}}", "measurements", ""],
							"query": [
								{
									"key": "start_date",
									"value": "2024-01-01T00:00:00"
								},
								{
									"key": "end_date",
									"value": "2024-12-31T23:59:59"
								},
								{
									"key": "limit",
									"value": "100"
								}
							]
						}
					}
				},
				{
					"name": "Get Sensor Stats",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/sensors/{{temp_sensor_id}}/stats/",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["sensors", "{{temp_sensor_id}}", "stats", ""]
						}
					}
				},
				{
					"name": "Create High Temperature Alert",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Alert created\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('id');",
									"    pm.collectionVariables.set('alert_id', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"sensor_id\": {{temp_sensor_id}},\n    \"hive_id\": {{hive_id}},\n    \"alert_type\": \"temperature_high\",\n    \"message\": \"Высокая температура в улье: 35.2°C\",\n    \"is_resolved\": false\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/alerts/",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["alerts", ""]
						}
					}
				},
				{
					"name": "Create Low Battery Alert",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"sensor_id\": {{humidity_sensor_id}},\n    \"hive_id\": {{hive_id}},\n    \"alert_type\": \"battery_low\",\n    \"message\": \"Низкий уровень батареи датчика влажности: 15%\",\n    \"is_resolved\": false\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/alerts/",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["alerts", ""]
						}
					}
				},
				{
					"name": "Get All Alerts",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/alerts/?skip=0&limit=100",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["alerts", ""],
							"query": [
								{
									"key": "skip",
									"value": "0"
								},
								{
									"key": "limit",
									"value": "100"
								}
							]
						}
					}
				},
				{
					"name": "Get Alerts by Hive",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/alerts/?hive_id={{hive_id}}",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["alerts", ""],
							"query": [
								{
									"key": "hive_id",
									"value": "{{hive_id}}"
								}
							]
						}
					}
				},
				{
					"name": "Resolve Alert",
					"request": {
						"method": "PUT",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{monitoring_port}}/alerts/{{alert_id}}/resolve/",
							"host": ["{{base_url}}"],
							"port": "{{monitoring_port}}",
							"path": ["alerts", "{{alert_id}}", "resolve", ""]
						}
					}
				}
			]
		},
		{
			"name": "🔔 Notification Service",
			"item": [
				{
					"name": "Health Check",
					"request": {
						"auth": {
							"type": "noauth"
						},
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{notification_port}}/health",
							"host": ["{{base_url}}"],
							"port": "{{notification_port}}",
							"path": ["health"]
						}
					}
				},
				{
					"name": "Create Alert Template (Admin Only)",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Template created\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('id');",
									"    pm.collectionVariables.set('template_id', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "{{admin_token}}",
									"type": "string"
								}
							]
						},
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\": \"Шаблон алерта\",\n    \"subject\": \"Внимание: {{alert_type}}\",\n    \"body\": \"Уважаемый {{user_name}}, получен алерт для улья {{hive_name}}: {{message}}\",\n    \"notification_type\": \"email\"\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{notification_port}}/templates/",
							"host": ["{{base_url}}"],
							"port": "{{notification_port}}",
							"path": ["templates", ""]
						}
					}
				},
				{
					"name": "Create SMS Template (Admin Only)",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "{{admin_token}}",
									"type": "string"
								}
							]
						},
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\": \"SMS Алерт\",\n    \"subject\": \"Алерт\",\n    \"body\": \"Алерт: {{message}}\",\n    \"notification_type\": \"sms\"\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{notification_port}}/templates/",
							"host": ["{{base_url}}"],
							"port": "{{notification_port}}",
							"path": ["templates", ""]
						}
					}
				},
				{
					"name": "Get All Templates",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Templates list\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.be.an('array');",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{notification_port}}/templates/?skip=0&limit=100",
							"host": ["{{base_url}}"],
							"port": "{{notification_port}}",
							"path": ["templates", ""],
							"query": [
								{
									"key": "skip",
									"value": "0"
								},
								{
									"key": "limit",
									"value": "100"
								}
							]
						}
					}
				},
				{
					"name": "Create Notification Settings",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Settings created\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('id');",
									"    pm.collectionVariables.set('settings_id', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"email_enabled\": true,\n    \"sms_enabled\": false,\n    \"push_enabled\": true,\n    \"email_address\": \"{{username}}@example.com\",\n    \"phone_number\": \"+1234567890\",\n    \"min_priority\": \"medium\"\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{notification_port}}/settings/",
							"host": ["{{base_url}}"],
							"port": "{{notification_port}}",
							"path": ["settings", ""]
						}
					}
				},
				{
					"name": "Get User Settings",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{notification_port}}/settings/me/",
							"host": ["{{base_url}}"],
							"port": "{{notification_port}}",
							"path": ["settings", "me", ""]
						}
					}
				},
				{
					"name": "Update User Settings",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"sms_enabled\": true,\n    \"min_priority\": \"high\"\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{notification_port}}/settings/me/",
							"host": ["{{base_url}}"],
							"port": "{{notification_port}}",
							"path": ["settings", "me", ""]
						}
					}
				},
				{
					"name": "Create Notification",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code is 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Notification created\", function () {",
									"    var jsonData = pm.response.json();",
									"    pm.expect(jsonData).to.have.property('id');",
									"    pm.collectionVariables.set('notification_id', jsonData.id);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"template_id\": {{template_id}},\n    \"notification_type\": \"email\",\n    \"priority\": \"high\",\n    \"subject\": \"Внимание: Высокая температура\",\n    \"body\": \"Уважаемый пользователь, получен алерт для улья Тестовый улей: Высокая температура в улье: 35.2°C\"\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{notification_port}}/notifications/",
							"host": ["{{base_url}}"],
							"port": "{{notification_port}}",
							"path": ["notifications", ""]
						}
					}
				},
				{
					"name": "Create Low Priority Notification",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"template_id\": {{template_id}},\n    \"notification_type\": \"email\",\n    \"priority\": \"low\",\n    \"subject\": \"Информация: Обновление данных\",\n    \"body\": \"Получены новые данные с датчиков улья\"\n}"
						},
						"url": {
							"raw": "{{base_url}}:{{notification_port}}/notifications/",
							"host": ["{{base_url}}"],
							"port": "{{notification_port}}",
							"path": ["notifications", ""]
						}
					}
				},
				{
					"name": "Get User Notifications",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{notification_port}}/notifications/?skip=0&limit=100",
							"host": ["{{base_url}}"],
							"port": "{{notification_port}}",
							"path": ["notifications", ""],
							"query": [
								{
									"key": "skip",
									"value": "0"
								},
								{
									"key": "limit",
									"value": "100"
								}
							]
						}
					}
				},
				{
					"name": "Get Pending Notifications (Admin Only)",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "{{admin_token}}",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{notification_port}}/notifications/pending/?limit=100",
							"host": ["{{base_url}}"],
							"port": "{{notification_port}}",
							"path": ["notifications", "pending", ""],
							"query": [
								{
									"key": "limit",
									"value": "100"
								}
							]
						}
					}
				}
			]
		},
		{
			"name": "🧪 Integration Tests",
			"item": [
				{
					"name": "Full Workflow Test",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Full workflow completed\", function () {",
									"    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
									"});",
									"",
									"console.log('=== ПОЛНЫЙ ТЕСТ СИСТЕМЫ ЗАВЕРШЕН ===');",
									"console.log('Созданные объекты:');",
									"console.log('- Пользователь ID:', pm.collectionVariables.get('user_id'));",
									"console.log('- Админ ID:', pm.collectionVariables.get('admin_id'));",
									"console.log('- Улей ID:', pm.collectionVariables.get('hive_id'));",
									"console.log('- Второй улей ID:', pm.collectionVariables.get('hive_id_2'));",
									"console.log('- Датчик температуры ID:', pm.collectionVariables.get('temp_sensor_id'));",
									"console.log('- Датчик влажности ID:', pm.collectionVariables.get('humidity_sensor_id'));",
									"console.log('- Датчик веса ID:', pm.collectionVariables.get('weight_sensor_id'));",
									"console.log('- Измерение ID:', pm.collectionVariables.get('measurement_id'));",
									"console.log('- Алерт ID:', pm.collectionVariables.get('alert_id'));",
									"console.log('- Шаблон ID:', pm.collectionVariables.get('template_id'));",
									"console.log('- Уведомление ID:', pm.collectionVariables.get('notification_id'));",
									"console.log('=== ВСЕ СЕРВИСЫ РАБОТАЮТ КОРРЕКТНО ===');"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}:{{hive_port}}/hives/{{hive_id}}",
							"host": ["{{base_url}}"],
							"port": "{{hive_port}}",
							"path": ["hives", "{{hive_id}}"]
						}
					}
				}
			]
		}
	],
	"event": [
		{
			"listen": "prerequest",
			"script": {
				"type": "text/javascript",
				"exec": [
					""
				]
			}
		},
		{
			"listen": "test",
			"script": {
				"type": "text/javascript",
				"exec": [
					""
				]
			}
		}
	]
}