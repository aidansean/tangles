<?php $title = 'Tangles' ;
$stylesheets = array('style.css') ;
$js_scripts  = array('functions.js') ;
include($_SERVER['FILE_PREFIX'] . '/_core/preamble.php') ;
?>
<div class="right">
  <div class="blurb">
    <canvas id="canvas_tangles" width="750" height="750"></canvas>
    <p class="center">
      Clicks: <span id="span_click">0</span>
      Rotations: <span id="span_rotate">0</span>
      Locks: <span id="span_lock">0</span>
      <br />
      <input id="input_graphics" type="submit" value="Change graphics"/>
      <input id="input_help" type="submit" value="Toggle help"/>
      <input id="input_autosolve" type="submit" value="Autosolve"/>
      <input id="input_sliders" type="submit" value="Toggle scrollbars"/><br />
      Canvas width: <input id="input_canvas_width" type="text"/>px 
      height: <input id="input_canvas_height" type="text"/>px 
      <input id="input_canvas_size" type="submit" value="Change size"/><br />
      <input id="input_canvas_size_750" type="submit" value="Change size to 750 x 750"/>
      <input id="input_canvas_size_600" type="submit" value="Change size to 600 x 600"/>
      <input id="input_canvas_size_500" type="submit" value="Change size to 500 x 500"/><br />
    </p>
    <p class="center"><a href="?level=1">Reset all progress</a>  Current level: <span id="span_level"></span></p>
  </div>

  <div id="div_debug"></div>
  <h3>How to play</h3>
  <p>The aim of the game is to connect up all the squares so that there are no loose ends:</p>
  <ul>
    <li>A line cannot end at the edge of a board.</li>
    <li>You do not need to connect all the lines up into a single shape.</li>
    <li>You can right click a square to lock it in place.</li>
    <li>If you get stuck, you can turn on the help feature that highlights mistakes, or use the autosolve feature to make the computer do some of the work for you.</li>
  </ul>
  <img src="/images/tangles.png" style="display:none"/>
</div>

<?php foot() ; ?>
