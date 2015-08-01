var canvas  = null ;
var context = null ;
var nRow = 3 ;
var nCol = 3 ;
var nRow_calc = nRow ;
var nCol_calc = nCol ;
var cells = null ;
var cw = 2000 ;
var ch = 2000 ;
var level = 1 ;
var graphic_set    = 4 ;
var n_graphic_sets = 4 ;
var density_factor = 4 ; // Density = 4/density_factor
var n_rotate = 0 ;
var n_lock   = 0 ;
var clicks_to_solve = 0 ;
var blank_cell = null ;
var counter = 0 ;
var player = 'human' ;
var help  = false ;
var debug = getParameterByName('debug') ;
var sw_min_px = 50 ;
var sh_min_px = 50 ;
var sw_calc = (cw-2*margin)/nCol ;
var sh_calc = (ch-2*margin)/nRow ;
var sw = sw_calc ;
var sh = sh_calc ;
var sw_px = sw ;
var sh_px = sh ;
var a0 = 0.0 ;
var b0 = 0.0 ;
var margin = 20 ;
var margin_px = 20 ;
var margin_color = 'rgb(255,255,255)' ;
var slider_color = 'rgb(100,100,100)' ;
var use_sliders = false ;
var score = 0 ;
var end_of_level = false ;

var colors = [] ;
colors.push(['rgb(150,  0,  0)' , 'rgb(100,  0,  0)']) ;
colors.push(['rgb(  0,150,  0)' , 'rgb(  0,100,  0)']) ;
colors.push(['rgb(  0,  0,200)' , 'rgb(  0,  0,125)']) ;
colors.push(['rgb(150,  0,150)' , 'rgb(100,  0,100)']) ;
colors.push(['rgb(  0,150,150)' , 'rgb(  0,100,100)']) ;
colors.push(['rgb(150,150,  0)' , 'rgb(100,100,  0)']) ;

function start(){
  canvas  = Get('canvas_tangles') ;
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
  draw_all() ;
  canvas.addEventListener('mousedown' ,click) ;
  canvas.addEventListener('touchstart',click) ;
  
  Get('button_graphics' ).addEventListener('click',change_graphics) ;
  Get('button_help'     ).addEventListener('click',toggle_help    ) ;
  Get('button_autosolve').addEventListener('click',iterate        ) ;
  Get('button_sliders'  ).addEventListener('click',toggle_sliders ) ;
  Get('button_reset'    ).addEventListener('click',reset_progress ) ;
  canvas.addEventListener("contextmenu", function(e){ e.preventDefault() ; }, false) ;
  
  Get('span_level').innerHTML = level ;
}
function reset_progress(){
  level = 0 ;
  next_level() ;
}

function change_size(){
  var w = parseInt(Get('button_canvas_width' ).value) ;
  var h = parseInt(Get('button_canvas_height').value) ;
  resize_canvas(w,h) ;
}
function resize_canvas(w,h){
  if(w>0) cw = w ;
  if(h>0) ch = h ;
  canvas.width  = cw ;
  canvas.height = ch ;
  context.lineCap = 'round' ;
  a0 = 0.0 ;
  b0 = 0.0 ;
  update_cellSize() ;
  draw_all() ;
}

function u_to_px(u){ return u*canvas.clientWidth/canvas.width ; } 
function px_to_u(p){ return p*canvas.width/canvas.clientWidth ; } 

function update_cellSize(){
  margin = px_to_u(margin_px) ;
  sw_calc = (cw-2*margin)/nCol ;
  sh_calc = (ch-2*margin)/nRow ;
  sw = sw_calc ;
  sh = sh_calc ;
  nRow_calc = nRow ;
  nCol_calc = nCol ;
  if(use_sliders==false) return ;
  
  var sw_calc_px = u_to_px(sw_calc) ;
  var sh_calc_px = u_to_px(sh_calc) ;
   
  sw_px = Math.max(sw_calc_px,sw_min_px) ;
  sh_px = Math.max(sh_calc_px,sh_min_px) ;
  nRow_calc = (sw_calc_px<sw_min_px) ? u_to_px(ch-2*margin)/sh_min_px : nRow ;
  nCol_calc = (sh_calc_px<sh_min_px) ? u_to_px(cw-2*margin)/sw_min_px : nCol ;
  sw = px_to_u(sw_px) ;
  sh = px_to_u(sh_px) ;
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
          score -= 2*result[1] ;
          if(result[0]) n_lock++ ;
        }
      }
    }
    check_success() ;
  }
  update_stats() ;
  draw_all() ;
  player = 'human' ;
}

function toggle_help(){
  help = !help ;
  draw_all() ;
}
function toggle_sliders(){
  use_sliders = !use_sliders ;
  a0 = 0.0 ;
  b0 = 0.0 ;
  update_cellSize() ;
  draw_all() ;
}

function change_graphics(){
  graphic_set++ ;
  if(graphic_set>n_graphic_sets) graphic_set = 1 ;
  draw_all() ;
}

function check_success(){
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      if(cells[i][j].is_valid()==false) return false ;
    }
  }
  var congrats_text = '' ;
  if(player=='computer'){
    draw_all() ;
    player = 'human' ;
  }
  else if(player=='human'){
    update_stats() ;
  }
  context.save() ;
  context.fillStyle   = 'rgba(255,255,255,0.75)' ;
  context.textBaseline = 'middle' ;
  context.strokeStyle = 'rgb(0,0,0)' ;
  context.lineWidth = 0.01*cw ;
  var margin = 0.1*cw ;
  
  // Draw curved box for results.
  context.beginPath() ;
  rounded_box_path(margin, margin, cw-margin, ch-margin, margin, context) ;
  context.closePath() ;
  context.fill() ;
  context.stroke() ;
  
  context.fillStyle = 'rgb(0,0,0)' ;
  context.textAlign = 'center' ;
  
  context.font = 0.1*cw + 'px sans-serif' ;
  wrapText('Level '+level,0.5*cw,2*margin,cw-3*margin,0.05*ch,true) ;
  
  context.font = 0.07*ch + 'px sans-serif' ;
  var lh = 0.09*ch ;
  
  var dh = 0.04 ;
  context.lineWidth = 0.005*cw ;
  context.strokeStyle = colors[level%6][0] ;
  context.fillStyle   = 'rgb(255,255,255)' ;
  rounded_box_path(0.2*cw, (0.4-dh)*ch, 0.8*cw, (0.4+dh)*ch, 0.5*dh*cw, context) ;
  context.fill() ; context.stroke() ;
  rounded_box_path(0.2*cw, (0.5-dh)*ch, 0.8*cw, (0.5+dh)*ch, 0.5*dh*cw, context) ;
  context.fill() ; context.stroke() ;
  rounded_box_path(0.2*cw, (0.6-dh)*ch, 0.8*cw, (0.6+dh)*ch, 0.5*dh*cw, context) ;
  context.fill() ; context.stroke() ;
  
  context.fillStyle = colors[level%6][0] ;
  rounded_box_path(0.2*cw, (0.4-dh)*ch, 0.6*cw, (0.4+dh)*ch, 0.5*dh*cw, context) ;
  context.fill() ;
  rounded_box_path(0.2*cw, (0.5-dh)*ch, 0.6*cw, (0.5+dh)*ch, 0.5*dh*cw, context) ;
  context.fill() ;
  rounded_box_path(0.2*cw, (0.6-dh)*ch, 0.6*cw, (0.6+dh)*ch, 0.5*dh*cw, context) ;
  context.fill() ;
  
  context.fillStyle = 'rgb(255,255,255)' ;
  context.textAlign = 'right' ;
  context.textBaseline = 'Middle' ;
  context.fillText('Par '   , 0.6*cw, 0.4*ch) ;
  context.fillText('Clicks ', 0.6*cw, 0.5*ch) ;
  context.fillText('Score ' , 0.6*cw, 0.6*ch) ;
  
  context.fillStyle = 'rgb(0,0,0)' ;  
  context.textAlign = 'left' ;
  wrapText(''+clicks_to_solve, 0.65*cw, 0.4*ch, cw-3*margin, lh, true) ;
  wrapText(''+n_rotate       , 0.65*cw, 0.5*ch, cw-3*margin, lh, true) ;
  wrapText(''+score          , 0.65*cw, 0.6*ch, cw-3*margin, lh, true) ;
  
  context.fillStyle   = colors[level%colors.length][0] ;
  rounded_box_path(0.2*cw, ch-2*margin-0.05*ch, 0.8*cw, ch-2*margin+0.05*ch, 0.5*dh*cw, context) ;
  context.fill() ;
  context.fillStyle   = 'rgb(255,255,255)' ;
  context.font = 0.05*ch + 'px sans-serif' ;
  context.textAlign = 'center' ;
  wrapText('Click to go to level '+(level+1),0.5*cw,ch-2*margin,cw-3*margin,0.06*ch,true) ;
  context.restore() ;
  end_of_level = true ;
}
function next_level(){
  level++ ;
  nRow = level+2 ;
  nCol = level+2 ;
  remake_cells() ;
  setCookie('tangles_level',level,300) ;
  Get('span_level').innerHTML = level ;
  draw_all() ;
  n_rotate = 0 ;
  n_lock   = 0 ;
  score = clicks_to_solve ;
  Get('span_rotate').innerHTML = n_rotate ;
  Get('span_lock'  ).innerHTML = n_lock   ;
  end_of_level = false ;
  Get('span_score' ).innerHTML = score    ;
}

function getParameterByName(name){
  // Taken from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search) ;
  return match && decodeURIComponent(match[1].replace(/\+/g, ' ')) ;
}
function setCookie(c_name,value,exdays){
  var exdate=new Date() ;
  exdate.setDate(exdate.getDate() + exdays) ;
  var c_value = escape(value) + ((exdays==null) ? '' : '; expires='+exdate.toUTCString()) ;
  document.cookie = c_name + '=' + c_value ;
}
function getCookie(c_name){
  var c_value = document.cookie ;
  var c_start = c_value.indexOf(' ' + c_name + '=') ;
  if(c_start == -1){ c_start = c_value.indexOf(c_name + '=') ; }
  if(c_start == -1){ c_value = null ; }
  else{
    c_start = c_value.indexOf('=', c_start) + 1 ;
    var c_end = c_value.indexOf(';', c_start) ;
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
      this.rotate(0) ;
    }
    var straight_line = false ;
    if(this.lines[0]==1 && this.lines[1]==0 && this.lines[2]==1 && this.lines[3]==0) straight_line = true ;
    if(this.lines[0]==0 && this.lines[1]==1 && this.lines[2]==0 && this.lines[3]==1) straight_line = true ;
    if(straight_line==true && n_success==2){ // Hack for straight lines
      n_success = 1 ;
      if(i_success>=2) i_success = i_success - 2 ;
    }
    if(n_success==1 && this.locked==false){
      for(var i=0 ; i<i_success ; i++){ this.rotate(0) ; }
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
  this.rotate = function(dScore){
    if(this.locked) return ;
    for(var i=0 ; i<3 ; i++) this.lines.push(this.lines.splice(0,1)) ;
    if(dScore){
      n_rotate++ ;
      score -= dScore ;
      draw_all() ;
      check_success() ;
    }
  }
  this.in_slider_range = function(){
    var X1 = margin-b0*sw+(this.b+0)*sw ;
    var Y1 = margin-a0*sh+(this.a+0)*sh ;
    var X2 = margin-b0*sw+(this.b+1)*sw ;
    var Y2 = margin-a0*sh+(this.a+1)*sh ;
    if(X1>cw || X2<0) return false ;
    if(Y1>ch || Y2<0) return false ;
    return true ;
  }
  this.draw_box  = function(){
    if(this.in_slider_range()==false) return ;
    var x0 = margin-b0*sw ;
    var y0 = margin-a0*sh ;
    this.color = colors[level%6][(this.a+this.b)%2]
    context.fillStyle = this.color ;
    context.fillRect(x0+this.b*sw-0.5,y0+this.a*sh-0.5,sw+1,sh+1) ;
  }
  this.draw_line = function(){
    if(this.in_slider_range()==false) return ;
    var x0 = margin-b0*sw ;
    var y0 = margin-a0*sh ;
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
      if(level%6==5 || level%6==4 || level%6==1){
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
    if(this.in_slider_range()==false) return ;
    var x0 = margin-b0*sw ;
    var y0 = margin-a0*sh ;
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
        c.rotate(0) ;
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
  score = clicks_to_solve ;
  Get('span_par'  ).innerHTML = clicks_to_solve ;
  Get('span_score').innerHTML = score           ;
  update_cellSize() ;
  draw_all() ;
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
  X *= canvas.width /canvas.clientWidth  ;
  Y *= canvas.height/canvas.clientHeight ;
  
  if(end_of_level){
    next_level() ;
    return ;
  }
  
  var b = Math.floor(b0+nRow_calc*(X-margin)/(ch-2*margin)) ;
  var a = Math.floor(a0+nCol_calc*(Y-margin)/(cw-2*margin)) ;
  if(a>=0 && a<nRow && Y>margin && Y<ch-margin){
    if(b>=0 && b<nCol && X>margin && X<cw-margin){
      var c = cells[a][b] ;
      if(rightclick){
        c.locked = !c.locked ;
        n_lock++ ;
        draw_all() ;
      }
      else{
        var dScore = (player=='human') ? 1 : 2 ;
        c.rotate(dScore) ;
      }
    }
  }
  if(use_sliders){
    if((Y<margin || Y>ch-margin) && (X>margin && X<cw-margin)){
      var x_frac   = u_to_px((cw-2*margin)*sw_calc)/sw_min_px ;
      var X_slider = (X<0.5*cw) ? Math.max(0.5*x_frac,X) : Math.min(cw-0.5*x_frac,X) ;
      var X_min    = X_slider - 0.5*x_frac ; // Move to start of slider
      var b_from_slider = 1.0*Math.floor(1*(X_min-margin)/(cw-2*margin)*nCol) ;
      b0 = b_from_slider ;
      if(b0<0) b0 = 0 ;
      if(b0>=nCol-1) b0 = nCol-1 ;
      draw_all() ;
    }
    if((X<margin || X>cw-margin) && (Y>margin && Y<ch-margin)){
      var y_frac   = u_to_px((ch-2*margin)*sh_calc)/sh_min_px ;
      var Y_slider = (Y<0.5*ch) ? Math.max(0.5*y_frac,Y) : Math.min(ch-0.5*y_frac,Y) ;
      var Y_min    = Y_slider - 0.5*y_frac ; // Move to start of slider
      var a_from_slider = 1.0*Math.floor(1*(Y_min-margin)/(ch-2*margin)*nRow) ;
      a0 = a_from_slider ;
      if(a0<0) a0 = 0 ;
      if(a0>=nRow-1) a0 = nRow-1 ;
      draw_all() ;
    }
  }
  update_stats() ;
}
function update_stats(){
  Get('span_rotate').innerHTML = n_rotate ;
  Get('span_lock'  ).innerHTML = n_lock   ;
  Get('span_score' ).innerHTML = score    ;
}

function wrapText(text,x,y_in,maxWidth,lineHeight,draw){
  // Taken from www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
  if(text==undefined) return 0 ;
  var words = text.split(' ') ;
  var line = '' ;
  var w = 0 ;
  var h = 0 ;
  var y = 0 ;

  for(var n=0 ; n<words.length ; n++){
    var testLine = line + words[n] + ' ' ;
    var testWidth = context.measureText(testLine).width ;
    if(testWidth>maxWidth){
      y = y_in+h ;
      if(draw) context.fillText(line, x, y) ;
      line = words[n] + ' ' ;
      h += lineHeight ;
    }
    else{
      line = testLine ;
      if(testWidth>w) w = testWidth ;
    }
  }
  y = y_in+h ;
  if(draw) context.fillText(line, x, y) ;
  h += lineHeight ;
  if(draw==-1) return w ;
  return h ;
}
function rounded_box_path(x1, y1, x2, y2, r, context){
  context.beginPath() ;
  context.moveTo(x1+r,y1) ;
  context.lineTo(x2-r,y1) ;
  context.arcTo (x2,y1,x2,y1+r,r) ;
  context.lineTo(x2,y2-r) ;
  context.arcTo (x2,y2,x2-r,y2,r)
  context.lineTo(x1+r,y2) ;
  context.arcTo (x1,y2,x1,y2-r,r)
  context.lineTo(x1,y1+r) ;
  context.arcTo (x1,y1,x1+r,y1,r)
}

function draw_all(){
  draw_grid() ;
  draw_margins() ;
  draw_sliders() ;
}
function draw_sliders(){
  if(use_sliders==false) return ;
  
  var ratioX = canvas.clientWidth /canvas.width  ;
  var ratioY = canvas.clientHeight/canvas.height ;
  var cellSizeX_px = sw_calc*ratioX ;
  var cellSizeY_px = sh_calc*ratioY ;
  
  if(cellSizeX_px>=sw_min_px && cellSizeY_px>=sh_min_px) return ;
  var line_x_length = (cw-2*margin)*sw_calc/(sw_min_px/ratioX) ;
  var line_y_length = (ch-2*margin)*sh_calc/(sh_min_px/ratioY) ;
  var line_x_start  = margin+(cw-2*margin)*b0/nCol ;
  var line_y_start  = margin+(cw-2*margin)*a0/nCol ;
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
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      cells[i][j].draw_help() ;
    }
  }
}
function Get(id){ return document.getElementById(id) ; }
