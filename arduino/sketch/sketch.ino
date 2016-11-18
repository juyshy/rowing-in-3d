/* threshold to keep the noise down */
const int TOLERANCE  = 3;
/* Pin definitions */
int leftPot = A0;    
int rightPot   = A1;
/* Global values for the pot's values */
int leftPotVal = 0;    
int rightPotVal   = 0;    

void setup() {
  Serial.begin(9600);
    while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }
  Serial.println("Pot test");
}

void loop() {

  int leftVal = analogRead( leftPot );    // read the value from the sensor 0
  int rightVal = analogRead( rightPot );    // read the value from the sensor 1

  bool changed_or_new_X = abs ( leftVal - leftPotVal ) >= TOLERANCE || ( leftVal == 0 && leftPotVal != 0 )  || ( leftVal == 1023 && leftPotVal != 1023 );
  bool changed_or_new_Y = abs ( rightVal - rightPotVal   ) >= TOLERANCE || ( rightVal == 0 && rightPotVal != 0 )    || ( rightVal == 1023 && rightPotVal   != 1023 );

  if ( changed_or_new_X || changed_or_new_Y ) {
    
    //int invertedX = abs( 1024 - leftVal );
    //int invertedY = abs( 1024 - rightVal );
    
    Serial.print( leftVal );
    Serial.print( "," );
    Serial.println( rightVal );
    leftPotVal = leftVal;
    rightPotVal = rightVal;
  }

  delay(10);
}



