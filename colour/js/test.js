macro oddadd {
 case (($x:lit) <+> $y:lit) => {
   $x + $y
 }
}

macro def {
  case $name:ident $params $body => {
    function $name $params $body
  }
}

define([], function(){

    var z = oddadd((2) <+> 4);
     console.log(z);

     def winning(a, b, c) {
       console.log('win', a);
     }

     return winning;

});


