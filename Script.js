const fractions = [
"1/16","1/8","3/16","1/4","5/16","3/8","7/16","1/2",
"9/16","5/8","11/16","3/4","13/16","7/8","15/16","1"
]

function fracToDec(f){

let p=f.split("/")
return p[0]/p[1]

}

function decimalToFraction(decimal){

let denom=16
let num=Math.round(decimal*denom)

let whole=Math.floor(num/denom)
num=num%denom

if(num===0) return whole

return whole+" "+num+"/16"

}

function populate(){

let selects=document.querySelectorAll("select")

selects.forEach(s=>{

fractions.forEach(f=>{

let o=document.createElement("option")

o.text=f+'"'
o.value=fracToDec(f)

s.add(o.cloneNode(true))

})

})

}

populate()



function bendCalc(){

let t=parseFloat(document.getElementById("thickness")?.value)

if(!t)return

let r=t

document.getElementById("radius").value=r.toFixed(3)

let angle=parseFloat(angleInput.value)

let leg1=parseFloat(leg1Input.value)
let leg2=parseFloat(leg2Input.value)

if(!angle||!leg1||!leg2)return

let k=0.33

let rad=angle*Math.PI/180

let nr=r+(k*t)

let ba=rad*nr

let ossb=(r+t)*Math.tan(rad/2)

let bd=(2*ossb)-ba

let flat=leg1+leg2-bd

document.getElementById("flat").innerText=
decimalToFraction(flat)

document.getElementById("borisFlat").innerText=
decimalToFraction(flat)

}

document.querySelectorAll("input,select")
.forEach(e=>e.addEventListener("input",bendCalc))



function tonnageCalc(){

let t=parseFloat(document.getElementById("t_thickness")?.value)
let length=parseFloat(document.getElementById("length")?.value)
let v=parseFloat(document.getElementById("v_die")?.value)

if(!t||!length||!v)return

let V=t*v

let tonPerFt=(575*t*t)/V

let tons=tonPerFt*(length/12)

document.getElementById("tonnage").innerText=
tons.toFixed(1)+" tons"

let result=document.getElementById("borisResult")
let graphic=document.getElementById("borisGraphic")

if(tons>200){

result.innerText="NO — This exceeds Boris' 200 ton capacity."

graphic.src="placeholder-too-big.png"

}else{

result.innerText="YES — Boris can bend this."

graphic.src="placeholder-success.png"

}

}

document.querySelectorAll("input,select")
.forEach(e=>e.addEventListener("input",tonnageCalc))