#include <Arduino.h>
#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <LiquidCrystal_I2C.h>
#include <WebSocketClient.h>

float tempCelcius = 0.0f;
float tempFaren = 0.0f;
String deviceId;
int ledPin = 6; // led is connected to pin 13
int fan1 = 14; // fan1 is connected to digital pin 14
const char* ssid     = "";
const char* password = "";
char path[] = "/";
const char* hostGet = "192.168.0.194";
char host[] = "192.168.0.194";

WebSocketClient webSocketClient;
LiquidCrystal_I2C lcd(0x27, 16, 2);

void adcValToTemperatures(float adcVal, float *celcius, float *farenheit);
void printTempToSerial(float adcVal, float tempCelcius, float tempFaren);

// Use WiFiClient class to create TCP connections
WiFiClient client;

void setup() {
  Serial.begin(115200);
  Wire.begin(D2, D1);   //Use predefined PINS consts
  lcd.begin(20, 4);     // The begin call takes the width and height. This
  // Should match the number provided to the constructor.
  lcd.backlight();      // Turn on the backlight.
  lcd.home();
  lcd.setCursor(0, 0);  // Move the cursor at origin
  lcd.print("Temperature is:");
  delay(10);


  // We start by connecting to a WiFi network

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  delay(5000);


  // Connect to the websocket server
  if (client.connect("192.168.0.194", 3000)) {
    Serial.println("Connected");
  } else {
    Serial.println("Connection failed.");
    while (1) {
      // Hang on failure
    }
  }

  // Handshake with the server
  webSocketClient.path = path;
  webSocketClient.host = host;
  if (webSocketClient.handshake(client)) {
    Serial.println("Handshake successful");
  } else {
    Serial.println("Handshake failed.");
    while (1) {
      // Hang on failure
    }
  }

  // Serial.print("Connecting to SQL...  ");
  //if (conn.connect(server_addr, 3306, user, passwords))
    //Serial.println("OK.");
  //else
    //Serial.println("FAILED.");

}


void loop() {
  String data;

  if (client.connected()) {
    webSocketClient.getData(data);
    if (data.length() > 0) {
      Serial.print("Received data: ");
      Serial.println(data);
    }
    
    float adcVal = analogRead(A0); 
    delay(1000);
    adcValToTemperatures(adcVal, &tempCelcius, &tempFaren);
    printTempToSerial(adcVal, tempCelcius, tempFaren);
  } else {
    Serial.println("Client disconnected.");
    while (1) {
      // Hang on disconnect.
    }
  }

  // wait to fully let the client disconnect
  delay(5000);

}

void adcValToTemperatures(float adcVal, float *celcius, float *farenheit) {
  *celcius = (adcVal / 1024.0) * 3300 / 10;
  *farenheit = (*celcius * 1.8) + 32;
}

void printTempToSerial(float adcVal, float tempCelcius, float tempFaren) {
  HTTPClient http;
  Serial.print("adc=");
  Serial.print(adcVal);
  Serial.print(" celcius=");
  Serial.print(tempCelcius);
  Serial.print(" farenheit=");
  Serial.println(tempFaren);
  lcd.setCursor(1, 1);
  lcd.print(tempCelcius);
  lcd.print((char)223);
  lcd.print("Celcius");
   String urlGet, postData;
 postData = String(tempCelcius);
 urlGet = "dist=" + postData;
 http.begin("http://192.168.0.194/tempserver/add.php");              //Specify request destination
 http.addHeader("Content-Type", "application/x-www-form-urlencoded");    //Specify content-type header
 
  int httpCode = http.POST(urlGet);   //Send the request
  String payload = http.getString();    //Get the response payload

  //Serial.println("LDR Value=" + ldrvalue);
  Serial.println(httpCode);   //Print HTTP return code
  Serial.println(payload);    //Print request response payload
  Serial.println("Temperature Value=" + String(tempCelcius));
  
  http.end();  //Close connection

 delay(4000);
 
  webSocketClient.sendData(String(tempCelcius));


 /* 
  // We now create and add parameters: 
    
    urlGet += F("/tempserver/add.php?dist=");
    urlGet += String(tempCelcius);
   
      Serial.print(">>> Connecting to host: ");
      Serial.println(hostGet);
      
       if (!client.connect(hostGet, 80)) {
        Serial.print("Connection failed: ");
        Serial.print(hostGet);
      } else {
          client.println("GET " + urlGet + " HTTP/1.1");
          client.print("Host: ");
          client.println(hostGet);
          client.println("User-Agent: ESP8266/1.0");
          client.println("Connection: close\r\n\r\n");

 

      } //end client connection if else
                        
    

  delay(1000); //pause to let things settle
  
  urlGet = "";
  
  
  return; */
}
