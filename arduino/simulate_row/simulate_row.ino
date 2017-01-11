/* threshold to keep the noise down */
 
/* Global values for the pot's values */
int leftPotVal = 0;    
int rightPotVal   = 0;    

const double Pi = 3.141593;
float cycleDuration = 4.0;
int delay_ms = 10;
float numberOfStepsInCircle = cycleDuration * 1000 / delay_ms;
double circleStep = Pi / numberOfStepsInCircle;
int indx= 0;
int max_potR = 752;
int max_potL = 676;
int min_potR = 145;
int min_potL = 82;
int maxPot_R_delta = max_potR - min_potR;
int maxPot_L_delta = max_potL - min_potL;

float rowingIncrR = maxPot_R_delta / numberOfStepsInCircle;

float rowingIncrL = maxPot_L_delta / numberOfStepsInCircle;

    
void setup() {
  Serial.begin(9600);
    while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }
  Serial.println("Pot simulate");
  Serial.print( "numberOfStepsInCircle " );
  Serial.println( numberOfStepsInCircle );
  Serial.print( "circleStep " );
  Serial.println( circleStep );
}


void loop() {

  double angle =  indx * circleStep;
  double cosin = cos( angle);
  double cosinMult = (cosin + 1) * 0.5;
  int leftVal  = cosinMult * maxPot_R_delta + min_potR;
  int rightVal = cosinMult * maxPot_L_delta + min_potL;

  /*
  Serial.print( "indx " );
  Serial.print( indx  );
  Serial.print( ": cosin " );
  Serial.print( cosin );
  Serial.print( ": cosinMult " );
  Serial.println( cosinMult );
  */
  Serial.print( leftVal );
  Serial.print( "," );
  Serial.println( rightVal );
  indx += 1;
  delay(delay_ms);
  if (indx > numberOfStepsInCircle*2) {
    indx = 0;
  }
}

