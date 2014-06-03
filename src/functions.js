var canvas  = null ;
var context = null ;
var nRow = 3 ;
var nCol = 3 ;
var nRow_calc = nRow ;
var nCol_calc = nCol ;
var cells = null ;
var cw = 750 ;
var ch = 750 ;
var level = 1 ;
var graphic_set    = 4 ;
var n_graphic_sets = 4 ;
var density_factor = 4 ; // Density = 4/density_factor
var n_click  = 0 ;
var n_rotate = 0 ;
var n_lock   = 0 ;
var clicks_to_solve = 0 ;
var blank_cell = null ;
var counter = 0 ;
var player = 'human' ;
var help  = false ;
var debug = getParameterByName('debug') ;
var sw_min = 50 ;
var sh_min = 50 ;
var sw = (cw-2*margin)/nCol ;
var sh = (ch-2*margin)/nRow ;
var sw_calc = (cw-2*margin)/nCol ;
var sh_calc = (ch-2*margin)/nRow ;
var a0 = 0.0 ;
var b0 = 0.0 ;
var margin = 20 ;
var margin_color = 'rgb(255,255,255)' ;
var slider_color = 'rgb(100,100,100)' ;
var use_sliders = false ;

function start(){
  canvas  = document.getElementById('canvas_tangles') ;
  context = canvas.getContext('2d') ;
  context.lineCap = 'round' ;
  
  blank_cell = new cell_object(-1,-1) ;
  blank_cell.locked = true ;
  var level_from_cookie = getCookie('tangles_level') ;
  if(level_from_cookie!=null && level_from_cookie!=''){
    level = parseInt(level_from_cookie) ;
  }
  var level_from_url = getParameterByName('level') ;
  if(level_from_url!=null && level_from_url!=''){
    level = parseInt(level_from_url) ;
    if(level<=0) level = 1 ;
  }
  nRow = 2+level ;
  nCol = 2+level ;
  
  remake_cells() ;
  draw_grid() ;
  canvas.addEventListener('mousedown',click) ;
  document.getElementById('input_graphics'   ).addEventListener('click',change_graphics) ;
  document.getElementById('input_help'       ).addEventListener('click',toggle_help    ) ;
  document.getElementById('input_autosolve'  ).addEventListener('click',iterate        ) ;
  document.getElementById('input_sliders'    ).addEventListener('click',toggle_sliders ) ;
  document.getElementById('input_canvas_size').addEventListener('click',change_size    ) ;
  document.getElementById('input_canvas_size_750').addEventListener('click',change_size_750) ;
  document.getElementById('input_canvas_size_600').addEventListener('click',change_size_600) ;
  document.getElementById('input_canvas_size_500').addEventListener('click',change_size_500) ;
  canvas.addEventListener("contextmenu", function(e){ e.preventDefault() ; }, false) ;
  
  document.getElementById('span_level').innerHTML = level ;
}

function change_size_750(){ resize_canvas(750,750) ; }
function change_size_600(){ resize_canvas(600,600) ; }
function change_size_500(){ resize_canvas(500,500) ; }
function change_size(){
  var w = parseInt(document.getElementById('input_canvas_width' ).value) ;
  var h = parseInt(document.getElementById('input_canvas_height').value) ;
  resize_canvas(w,h) ;
}
function resize_canvas(w,h){
  if(w>0) cw = w ;
  if(h>0) ch = h ;
  canvas.width  = cw ;
  canvas.height = ch ;
  context.lineCap = 'round' ;
  a0 = 0 ;
  b0 = 0 ;
  update_cellSize() ;
  draw_grid() ;
}

function update_cellSize(){
   sw_calc = (cw-2*margin)/nCol ;
   sh_calc = (ch-2*margin)/nRow ;
   sw = sw_calc ;
   sh = sh_calc ;
   nRow_calc = nRow ;
   nCol_calc = nCol ;
   if(use_sliders==false) return ;
   sw = Math.max(sw_calc,sw_min) ;
   sh = Math.max(sh_calc,sh_min) ;
   nRow_calc = (sw_calc<sw_min) ? (ch-2*margin)/sh_min : nRow ;
   nCol_calc = (sh_calc<sh_min) ? (cw-2*margin)/sw_min : nCol ;
}
function iterate(){
  player = 'computer' ;
  counter = 0 ;
  var success = true ;
  while(success==true && counter<50){
    if(player=='human') return ;
    success = false ;
    counter++ ;
    for(var i=0 ; i<nRow ; i++){
      for(var j=0 ; j<nCol ; j++){
        var result = cells[i][j].attempt_match() ;
        if(result[0]==true){
          success = true ;
          n_rotate += result[1] ;
          n_click  += result[1] ;
          if(result[0]) n_lock++ ;
        }
      }
    }
    check_success() ;
  }
  update_stats() ;
  draw_grid() ;
  alert('I did my best, but I have failed you.  Can you ever forgive me?  I left you with ' + n_rotate + ' clicks.') ;
  player = 'human' ;
}

function toggle_help(){
  help = !help ;
  draw_grid() ;
}
function toggle_sliders(){
  use_sliders = !use_sliders ;
  update_cellSize() ;
  draw_grid() ;
}

function change_graphics(){
  graphic_set++ ;
  if(graphic_set>n_graphic_sets) graphic_set = 1 ;
  draw_grid() ;
}

function check_success(){
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      if(cells[i][j].is_valid()==false) return false ;
    }
  }
  if(player=='computer'){
    draw_grid() ;
    alert('I worked very hard for you and solved the puzzle in '+ n_rotate +' clicks.') ;
    player = 'human' ;
  }else if(player=='human'){
    update_stats() ;
    var computer_congrats = (n_click>=clicks_to_solve) ? '' : '  In your face, computer!' ;
    alert('Congratulations!  You solved the puzzle with '+ n_click +' clicks!\n\n(According to your computer, it could have been solved in '+ clicks_to_solve +' clicks.'+computer_congrats+')') ;
  }
  next_level() ;
}
function next_level(){
  level++ ;
  nRow = level+2 ;
  nCol = level+2 ;
  remake_cells() ;
  setCookie('tangles_level',level,300) ;
  document.getElementById('span_level').innerHTML = level ;
  draw_grid() ;
  n_click  = 0 ;
  n_rotate = 0 ;
  n_lock   = 0 ;
  document.getElementById('span_click' ).innerHTML = n_click  ;
  document.getElementById('span_rotate').innerHTML = n_rotate ;
  document.getElementById('span_lock'  ).innerHTML = n_lock   ;
}

function getParameterByName(name){
  // Taken from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search) ;
  return match && decodeURIComponent(match[1].replace(/\+/g, ' ')) ;
}
function setCookie(c_name,value,exdays){
  var exdate=new Date() ;
  exdate.setDate(exdate.getDate() + exdays) ;
  var c_value = escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString()) ;
  document.cookie = c_name + "=" + c_value ;
}
function getCookie(c_name){
  var c_value = document.cookie ;
  var c_start = c_value.indexOf(" " + c_name + "=") ;
  if(c_start == -1){ c_start = c_value.indexOf(c_name + "=") ; }
  if(c_start == -1){ c_value = null ; }
  else{
    c_start = c_value.indexOf("=", c_start) + 1 ;
    var c_end = c_value.indexOf(";", c_start) ;
    if(c_end == -1){
      c_end = c_value.length ;
    }
    c_value = unescape(c_value.substring(c_start,c_end)) ;
  }
  return c_value ;
}

function cell_object(a,b){
  this.lines = [0,0,0,0] ; // N,E,S,W
  this.locked = false ;
  this.n_line = 0 ;
  this.a = a ; // a is the row    (the "y-like" parameter)
  this.b = b ; // a is the column (the "x-like" parameter)
  this.color = 'rgb(255,255,255)' ; // Default colour
  this.is_valid = function(){ return this.error_code()==0 ; }
  this.neighbours = [blank_cell,blank_cell,blank_cell,blank_cell] ;
  this.set_neighbours = function(){
    if(this.a>0     ) this.neighbours[0] = cells[this.a-1][this.b] ;
    if(this.b<nCol-1) this.neighbours[1] = cells[this.a][this.b+1] ;
    if(this.a<nRow-1) this.neighbours[2] = cells[this.a+1][this.b] ;
    if(this.b>0     ) this.neighbours[3] = cells[this.a][this.b-1] ;
  }
  this.neighbour_statii = function(){
    var statii = [] ;
    for(var i=0 ; i<this.neighbours.length ; i++){
      if(this.neighbours[i].locked==true && this.neighbours[i].lines[(i+2)%4]==true){
        statii.push(1) ;
      }
      else if(this.neighbours[i].locked==true && this.neighbours[i].lines[(i+2)%4]==false){
        statii.push(0) ;
      }
      else{
        statii.push(-1) ;
      }
    }
    return statii ;
  }
  this.attempt_match = function(){
    if(this.locked) return [false,0] ;
    var statii = this.neighbour_statii() ;
    var n_lines = 0 ;
    for(var i=0 ; i<4 ; i++){ n_lines += parseInt(this.lines[i]) ; }
    var n_success =  0 ;
    var i_success = -1 ;
    for(var i=0 ; i<4 ; i++){
      var success = true ;
      for(var j=0 ; j<4 ; j++){
        if(parseInt(statii[j])+parseInt(this.lines[j])==1) success = false ;
      }
      if(success==true){
        n_success++ ;
        i_success = i ;
      }
      this.rotate(false) ;
    }
    var straight_line = false ;
    if(this.lines[0]==1 && this.lines[1]==0 && this.lines[2]==1 && this.lines[3]==0) straight_line = true ;
    if(this.lines[0]==0 && this.lines[1]==1 && this.lines[2]==0 && this.lines[3]==1) straight_line = true ;
    if(straight_line==true && n_success==2){ // Hack for straight lines
      n_success = 1 ;
      if(i_success>=2) i_success = i_success - 2 ;
    }
    if(n_success==1 && this.locked==false){
      for(var i=0 ; i<i_success ; i++){ this.rotate(false) ; }
      this.locked = true ;
      return [true,i_success] ;
    }
    if((n_lines%4)==0 && this.locked==false){
      this.locked = true ;
      return [true,0] ;
    }
    return [false,0] ;
  }
  
  this.error_code = function(){
    var result = false ;
    for(var i=0 ; i<4 ; i++){
      if(this.lines[i]==true && this.neighbours[i].lines[(i+2)%4]==false) result = true ;
    }
    return result ;
  }
  this.rotate = function(perform_check){
    if(perform_check) n_click++ ;
    if(this.locked) return ;
    for(var i=0 ; i<3 ; i++) this.lines.push(this.lines.splice(0,1)) ;
    if(perform_check){
      n_rotate++ ;
      draw_grid() ;
      check_success() ;
    }
  }
  this.draw_box  = function(){
    if(level%6==0    ) this.color = ((this.a+this.b)%2==0) ? 'rgb(150,  0,  0)' : 'rgb(100,  0,  0)' ;
    if(level%6==1    ) this.color = ((this.a+this.b)%2==0) ? 'rgb(  0,150,  0)' : 'rgb(  0,100,  0)' ;
    if(level%6==2    ) this.color = ((this.a+this.b)%2==0) ? 'rgb(  0,  0,200)' : 'rgb(  0,  0,125)' ;
    if(level%6==3    ) this.color = ((this.a+this.b)%2==0) ? 'rgb(150,  0,150)' : 'rgb(100,  0,100)' ;
    if(level%6==4    ) this.color = ((this.a+this.b)%2==0) ? 'rgb(  0,150,150)' : 'rgb(  0,100,100)' ;
    if(level%6==5    ) this.color = ((this.a+this.b)%2==0) ? 'rgb(150,150,  0)' : 'rgb(100,100,  0)' ;
    //if(this.locked==true) this.color = 'rgb(0,0,0)' ;
    context.fillStyle = this.color ;
    var x0 = margin-a0*sw ;
    var y0 = margin-b0*sh ;
    context.fillRect(x0+this.b*sw-0.5,y0+this.a*sh-0.5,sw+1,sh+1) ;
  }
  this.draw_line = function(){
    var x0 = margin-a0*sw ;
    var y0 = margin-b0*sh ;
    var n_links = 0 ;
    for(var i=0 ; i<4 ; i++){
      if(this.lines[i]==1) n_links++ ;
    }
    context.beginPath() ;
    context.strokeStyle = 'rgb(255,255,255)' ;
    context.fillStyle   = 'rgb(255,255,255)' ;
    if(this.locked){
      context.strokeStyle = 'rgb(150,150,150)' ;
      context.fillStyle   = 'rgb(150,150,150)' ;
      if(level%6==5 || level%6==4){
        context.strokeStyle = 'rgb(0,0,0)' ;
        context.fillStyle   = 'rgb(0,0,0)' ;
      }
    }
    context.lineWidth = 0.1*sw ;
    switch(n_links){
      case 0: return ; break ;
      case 1:
        if(graphic_set==1 || graphic_set==4){
          context.beginPath() ;
          context.arc(x0+(this.b+0.5)*sw,y0+(this.a+0.5)*sh,0.15*sw,0,2*Math.PI,true) ;
          context.fill() ;
        }
        else if(graphic_set==3){
          context.lineWidth = 0.05*sw ;
          var d  = 0.05*sw ;
          var d2 = 0.2*sw ;
          if(this.lines[0]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.5)*sw-d,y0+(this.a+0.0)*sh) ;
            context.lineTo(x0+(this.b+0.5)*sw-d,y0+(this.a+0.5)*sh) ;
            context.moveTo(x0+(this.b+0.5)*sw+d,y0+(this.a+0.0)*sh) ;
            context.lineTo(x0+(this.b+0.5)*sw+d,y0+(this.a+0.5)*sh) ;
            context.fillRect(x0+(this.b+0.5)*sw-d2,y0+(this.a+0.5)*sh,2*d2,0.5*d2) ;
            context.stroke() ;
          }
          if(this.lines[1]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.5)*sw,y0+(this.a+0.5)*sh-d) ;
            context.lineTo(x0+(this.b+1.0)*sw,y0+(this.a+0.5)*sh-d) ;
            context.moveTo(x0+(this.b+0.5)*sw,y0+(this.a+0.5)*sh+d) ;
            context.lineTo(x0+(this.b+1.0)*sw,y0+(this.a+0.5)*sh+d) ;
            context.fillRect(x0+(this.b+0.5)*sw,y0+(this.a+0.5)*sh-d2,-0.5*d2,2*d2) ;
            context.stroke() ;
          }
          if(this.lines[2]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.5)*sw-d,y0+(this.a+0.5)*sh) ;
            context.lineTo(x0+(this.b+0.5)*sw-d,y0+(this.a+1.0)*sh) ;
            context.moveTo(x0+(this.b+0.5)*sw+d,y0+(this.a+0.5)*sh) ;
            context.lineTo(x0+(this.b+0.5)*sw+d,y0+(this.a+1.0)*sh) ;
            context.fillRect(x0+(this.b+0.5)*sw-d2,y0+(this.a+0.5)*sh,2*d2,-0.5*d2) ;
            context.stroke() ;
          }
          if(this.lines[3]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+0.5)*sh-d) ;
            context.lineTo(x0+(this.b+0.5)*sw,y0+(this.a+0.5)*sh-d) ;
            context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+0.5)*sh+d) ;
            context.lineTo(x0+(this.b+0.5)*sw,y0+(this.a+0.5)*sh+d) ;
            context.fillRect(x0+(this.b+0.5)*sw,y0+(this.a+0.5)*sh-d2,0.5*d2,2*d2) ;
            context.stroke() ;
          }
        }
        if(graphic_set==4){
          context.lineWidth = 0.1*sw ;
          context.beginPath() ;
          if     (this.lines[0]==1){ context.moveTo(x0+(this.b+0.5)*sw,y0+(this.a+0.0)*sh) ; }
          else if(this.lines[1]==1){ context.moveTo(x0+(this.b+1.0)*sw,y0+(this.a+0.5)*sh) ; }
          else if(this.lines[2]==1){ context.moveTo(x0+(this.b+0.5)*sw,y0+(this.a+1.0)*sh) ; }
          else if(this.lines[3]==1){ context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+0.5)*sh) ; }
          context.lineTo(x0+(this.b+0.5)*sw,y0+(this.a+0.5)*sh) ;
          context.stroke() ;
        }
      case 2:
      case 3:
      case 4:
        context.beginPath() ;
        context.lineWidth = 0.1*sw ;
        var d = 0.05*sw ;
        if(graphic_set<=2){
          context.beginPath() ;
          if(this.lines[0]==1){
            context.moveTo(x0+(this.b+0.5)*sw,y0+(this.a+0.0)*sh) ;
            context.lineTo(x0+(this.b+0.5)*sw,y0+(this.a+0.5)*sh) ;
          }
          if(this.lines[1]==1){
            context.moveTo(x0+(this.b+1.0)*sw,y0+(this.a+0.5)*sh) ;
            context.lineTo(x0+(this.b+0.5)*sw,y0+(this.a+0.5)*sh) ;
          }
          if(this.lines[2]==1){
            context.moveTo(x0+(this.b+0.5)*sw,y0+(this.a+1.0)*sh) ;
            context.lineTo(x0+(this.b+0.5)*sw,y0+(this.a+0.5)*sh) ;
          }
          if(this.lines[3]==1){
            context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+0.5)*sh) ;
            context.lineTo(x0+(this.b+0.5)*sw,y0+(this.a+0.5)*sh) ;
          }
          context.stroke() ;
        }
        else if(graphic_set==3){
          context.lineWidth = 0.05*sw ;
          if(this.lines[0]==1 && this.lines[2]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.5)*sw-d,y0+(this.a+0.0)*sh) ;
            context.lineTo(x0+(this.b+0.5)*sw-d,y0+(this.a+1.0)*sh) ;
            context.moveTo(x0+(this.b+0.5)*sw+d,y0+(this.a+0.0)*sh) ;
            context.lineTo(x0+(this.b+0.5)*sw+d,y0+(this.a+1.0)*sh) ;
            context.stroke() ;
          }
          if(this.lines[1]==1 && this.lines[3]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+0.5)*sh-d) ;
            context.lineTo(x0+(this.b+1.0)*sw,y0+(this.a+0.5)*sh-d) ;
            context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+0.5)*sh+d) ;
            context.lineTo(x0+(this.b+1.0)*sw,y0+(this.a+0.5)*sh+d) ;
            context.stroke() ;
          }
          if(this.lines[0]==1 && this.lines[1]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+1.0)*sw,y0+(this.a+0.5)*sh-d) ;
            context.arc   (x0+(this.b+1.0)*sw,y0+(this.a+0.0)*sh,0.5*sw-d,0.5*Math.PI,1.0*Math.PI) ;
            context.moveTo(x0+(this.b+1.0)*sw,y0+(this.a+0.5)*sh+d) ;
            context.arc   (x0+(this.b+1.0)*sw,y0+(this.a+0.0)*sh,0.5*sw+d,0.5*Math.PI,1.0*Math.PI) ;
            context.stroke() ;
          }
          if(this.lines[0]==1 && this.lines[3]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.5)*sw-d,y0+(this.a+0.0)*sh) ;
            context.arc   (x0+(this.b+0.0)*sw  ,y0+(this.a+0.0)*sh,0.5*sw-d,0*Math.PI,0.5*Math.PI) ;
            context.moveTo(x0+(this.b+0.5)*sw+d,y0+(this.a+0.0)*sh) ;
            context.arc   (x0+(this.b+0.0)*sw  ,y0+(this.a+0.0)*sh,0.5*sw+d,0*Math.PI,0.5*Math.PI) ;
            context.stroke() ;
          }
          if(this.lines[2]==1 && this.lines[1]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.5)*sw+d,y0+(this.a+1.0)*sh) ;
            context.arc   (x0+(this.b+1.0)*sw  ,y0+(this.a+1.0)*sh,0.5*sw-d,1*Math.PI,1.5*Math.PI) ;
            context.moveTo(x0+(this.b+0.5)*sw-d,y0+(this.a+1.0)*sh) ;
            context.arc   (x0+(this.b+1.0)*sw  ,y0+(this.a+1.0)*sh,0.5*sw+d,1*Math.PI,1.5*Math.PI) ;
            context.stroke() ;
          }
          if(this.lines[2]==1 && this.lines[3]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+0.5)*sh+d) ;
            context.arc   (x0+(this.b+0.0)*sw,y0+(this.a+1.0)*sh,0.5*sw-d,1.5*Math.PI,2.0*Math.PI) ;
            context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+0.5)*sh-d) ;
            context.arc   (x0+(this.b+0.0)*sw,y0+(this.a+1.0)*sh,0.5*sw+d,1.5*Math.PI,2.0*Math.PI) ;
            context.stroke() ;
          }
        }
        else if(graphic_set==4){
          context.lineWidth = 0.1*sw ;
          if(this.lines[0]==1 && this.lines[2]==1 && this.lines[3]==0 && this.lines[1]==0){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.5)*sw,y0+(this.a+0.0)*sh) ;
            context.lineTo(x0+(this.b+0.5)*sw,y0+(this.a+1.0)*sh) ;
            context.stroke() ;
          }
          if(this.lines[1]==1 && this.lines[3]==1 && this.lines[0]==0 && this.lines[2]==0){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+0.5)*sh) ;
            context.lineTo(x0+(this.b+1.0)*sw,y0+(this.a+0.5)*sh) ;
            context.stroke() ;
          }
          if(this.lines[0]==1 && this.lines[1]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+1.0)*sw,y0+(this.a+0.5)*sh) ;
            context.arc   (x0+(this.b+1.0)*sw,y0+(this.a+0.0)*sh,0.5*sw,0.5*Math.PI,1.0*Math.PI) ;
            context.stroke() ;
          }
          if(this.lines[0]==1 && this.lines[3]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.5)*sw,y0+(this.a+0.0)*sh) ;
            context.arc   (x0+(this.b+0.0)*sw,y0+(this.a+0.0)*sh,0.5*sw,0*Math.PI,0.5*Math.PI) ;
            context.stroke() ;
          }
          if(this.lines[2]==1 && this.lines[1]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.5)*sw,y0+(this.a+1.0)*sh) ;
            context.arc   (x0+(this.b+1.0)*sw,y0+(this.a+1.0)*sh,0.5*sw,1*Math.PI,1.5*Math.PI) ;
            context.stroke() ;
          }
          if(this.lines[2]==1 && this.lines[3]==1){
            context.beginPath() ;
            context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+0.5)*sh) ;
            context.arc   (x0+(this.b+0.0)*sw,y0+(this.a+1.0)*sh,0.5*sw,1.5*Math.PI,2.0*Math.PI) ;
            context.stroke() ;
          }
        }
        break ;
    }
  }
  this.draw_help = function(){
    var x0 = margin-a0*sw ;
    var y0 = margin-b0*sh ;
    if(help){
      context.beginPath() ;
      context.strokeStyle = 'rgb(255,0,0)' ;
      if(level%6==0) context.strokeStyle = 'rgb(255,255,0)' ;
      context.lineWidth = 2 ;
      if((parseInt(this.lines[0])+parseInt(this.neighbours[0].lines[2]))==1){
        context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+0.0)*sh) ;
        context.lineTo(x0+(this.b+1.0)*sw,y0+(this.a+0.0)*sh) ;
      }
      if((parseInt(this.lines[1])+parseInt(this.neighbours[1].lines[3]))==1){
        context.moveTo(x0+(this.b+1.0)*sw,y0+(this.a+0.0)*sh) ;
        context.lineTo(x0+(this.b+1.0)*sw,y0+(this.a+1.0)*sh) ;
      }
      if((parseInt(this.lines[2])+parseInt(this.neighbours[2].lines[0]))==1){
        context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+1.0)*sh) ;
        context.lineTo(x0+(this.b+1.0)*sw,y0+(this.a+1.0)*sh) ;
      }
      if((parseInt(this.lines[3])+parseInt(this.neighbours[3].lines[1]))==1){
        context.moveTo(x0+(this.b+0.0)*sw,y0+(this.a+0.0)*sh) ;
        context.lineTo(x0+(this.b+0.0)*sw,y0+(this.a+1.0)*sh) ;
      }
      context.stroke() ;
    }
  }
  this.clone = function(){
    var cell = new cell_object() ;
    for(var i=0 ; i<4 ; i++){
      cell.lines[i] = this.lines[i] ;
    }
    cell.b = this.b ;
    cell.a = this.a ;
    cell.locked = this.locked ;
    return cell ;
  }
}

function remake_cells(){
  cells = [] ;
  // Randomly assign lines
  for(var i=0 ; i<nRow ; i++){
    cells.push([]) ;
    for(var j=0 ; j<nCol ; j++){
      var c = new cell_object(i,j) ;
      var rN = Math.floor(density_factor*Math.random()) ;
      var rE = Math.floor(density_factor*Math.random()) ;
      var rS = Math.floor(density_factor*Math.random()) ;
      var rW = Math.floor(density_factor*Math.random()) ;
      if(rN==0 && i>0     ) c.lines[0] = 1 ;
      if(rE==0 && j<nCol-1) c.lines[1] = 1 ;
      if(rS==0 && i<nRow-1) c.lines[2] = 1 ;
      if(rW==0 && j>0     ) c.lines[3] = 1 ;
      cells[i].push(c) ;
    }
  }
  // Now match up the cells
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      if(cells[i][j].lines[0]) cells[i-1][j].lines[2] = 1 ;
      if(cells[i][j].lines[1]) cells[i][j+1].lines[3] = 1 ;
      if(cells[i][j].lines[2]) cells[i+1][j].lines[0] = 1 ;
      if(cells[i][j].lines[3]) cells[i][j-1].lines[1] = 1 ;
    }
  }
  // Scramble cells
  clicks_to_solve = 0 ;
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      var r = Math.floor(4*Math.random()) ;
      var c = cells[i][j] ;
      if(c.lines[0]==false && c.lines[1]==false && c.lines[2]==false && c.lines[1]==false) r =   0 ;
      if(c.lines[0]==true  && c.lines[1]==true  && c.lines[2]==true  && c.lines[1]==true ) r =   0 ;
      if(c.lines[0]==true  && c.lines[1]==false && c.lines[2]==true  && c.lines[1]==false) r = r%2 ;
      if(c.lines[0]==false && c.lines[1]==true  && c.lines[2]==false && c.lines[1]==true ) r = r%2 ;
      clicks_to_solve += (r==0) ? 0 : (4-r) ;
      for(var k=0 ; k<r ; k++){
        c.rotate(false) ;
      }
    }
  }
  // Set types and neighbours
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      var c = cells[i][j] ;
      if(c.lines[0]) c.n_line++ ;
      if(c.lines[1]) c.n_line++ ;
      if(c.lines[2]) c.n_line++ ;
      if(c.lines[3]) c.n_line++ ;
      c.set_neighbours() ;
    }
  }
  update_cellSize() ;
  draw_grid() ;
}
function XY_from_mouse(evt){
  var X = evt.pageX - evt.target.offsetLeft ;
  var Y = evt.pageY - evt.target.offsetTop  ;
  return [X,Y] ;
}
function click(evt){
  evt.preventDefault() ;
  // Is it a right click?
  var rightclick ;
  if(!evt) var evt = window.event ;
  if(evt.which) rightclick = (evt.which==3) ;
  else if(evt.button) rightclick = (evt.button==2) ;

  var XY = XY_from_mouse(evt) ;
  var X = XY[0] ;
  var Y = XY[1] ;
  var a = Math.floor(a0+nRow_calc*(X-margin)/(ch-2*margin)) ;
  var b = Math.floor(b0+nCol_calc*(Y-margin)/(cw-2*margin)) ;
  if(a>=0 && a<nRow && Y>margin && Y<ch-margin){
    if(b>=0 && b<nCol && X>margin && X<cw-margin){
      if(rightclick){
        cells[b][a].locked = !cells[b][a].locked ;
        n_lock++ ;
        draw_grid() ;
      }
      else{
        cells[b][a].rotate(true) ;
      }
    }
  }
  if((Y<margin || Y>ch-margin) && (X>margin && X<cw-margin)){
    var x_frac   = (cw-2*margin)*sw_calc/sw_min ;
    var X_slider = (X<0.5*cw) ? Math.max(0.5*x_frac,X) : Math.min(cw-0.5*x_frac,X) ;
    var X_min    = X_slider - 0.5*x_frac ; // Move to start of slider
    var a_from_slider = 1.0*Math.floor(1*(X_min-margin)/(cw-2*margin)*nCol) ;
    a0 = a_from_slider ;
    if(a0<0) a0 = 0 ;
    //if(a0>nCol*(1-x_frac)) a0 = nCol*(1-x_frac) ;
    draw_grid() ;
  }
  if((X<margin || X>cw-margin) && (Y>margin && Y<ch-margin)){
    var y_frac   = (ch-2*margin)*sh_calc/sh_min ;
    var Y_slider = (Y<0.5*ch) ? Math.max(0.5*y_frac,Y) : Math.min(ch-0.5*y_frac,Y) ;
    var Y_min    = Y_slider - 0.5*y_frac ; // Move to start of slider
    var b_from_slider = 1.0*Math.floor(1*(Y_min-margin)/(ch-2*margin)*nRow) ;
    b0 = b_from_slider ;
    if(b0<0) b0 = 0 ;
    //if(b0>nRow*(1-y_frac)) b0 = nRow*(1-y_frac) ;
    draw_grid() ;
  }
  update_stats() ;
}
function update_stats(){
  document.getElementById('span_click' ).innerHTML = n_click  ;
  document.getElementById('span_rotate').innerHTML = n_rotate ;
  document.getElementById('span_lock'  ).innerHTML = n_lock   ;
}
function draw_sliders(){
  if(use_sliders==false) return ;
  if(sw_calc>=sw_min && sh_calc>=sh_min) return ;
  var line_x_length = (cw-2*margin)*sw_calc/sw_min ;
  var line_y_length = (ch-2*margin)*sh_calc/sh_min ;
  var line_x_start  = margin+(cw-2*margin)*a0/nCol ;
  var line_y_start  = margin+(cw-2*margin)*b0/nCol ;
  if(line_x_start+line_x_length>cw-margin) line_x_start = cw-margin-line_x_length ;
  if(line_y_start+line_y_length>ch-margin) line_y_start = ch-margin-line_y_length ;
  
  context.strokeStyle = slider_color ;
  context.lineWidth = 0.5*margin ;
  context.beginPath() ;
  // First top and left of screen, then lower and right
  context.moveTo(0.5*margin                ,line_y_start              ) ;
  context.lineTo(0.5*margin                ,line_y_start+line_y_length) ;
  context.moveTo(line_x_start              ,0.5*margin                ) ;
  context.lineTo(line_x_start+line_x_length,0.5*margin                ) ;
  context.moveTo(cw-0.5*margin             ,line_y_start              ) ;
  context.lineTo(cw-0.5*margin             ,line_y_start+line_y_length) ;
  context.moveTo(line_x_start              ,ch-0.5*margin             ) ;
  context.lineTo(line_x_start+line_x_length,ch-0.5*margin             ) ;
  context.stroke() ;
}
function draw_margins(){
  context.fillStyle = margin_color ;
  context.fillRect(0,0,margin,ch) ;
  context.fillRect(0,0,cw,margin) ;
  context.fillRect(cw-margin,0,margin,ch) ;
  context.fillRect(0,ch-margin,cw,margin) ;
}
function draw_grid(){
  context.fillStyle = 'rgb(255,255,255)' ;
  context.fillRect(0,0,cw,ch) ;
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      cells[i][j].draw_box() ;
    }
  }
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      cells[i][j].draw_line() ;
    }
  }
  draw_margins() ;
  draw_sliders() ;
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      cells[i][j].draw_help() ;
    }
  }
}