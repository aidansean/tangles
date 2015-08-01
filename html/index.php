<?php $title = 'Tangles' ;
$stylesheets = array('style.css') ;
$js_scripts  = array('functions.js') ;
include($_SERVER['FILE_PREFIX'] . '/_core/preamble.php') ;
?>
<div class="right">
  <h2>How to play</h2>
  <div class="blurb">
    <p>The aim of the game is to connect up all the squares so that there are no loose ends:</p>
    <ul>
      <li>A line cannot end at the edge of a board.</li>
      <li>You do not need to connect all the lines up into a single shape.</li>
      <li>You can right click a square to lock it in place.</li>
      <li>If you get stuck, you can turn on the help feature that highlights mistakes, or use the autosolve feature to make the computer do some of the work for you.</li>
    </ul>
  <p>The "par" is the number of rotations the computer used to make the current puzzle.  If you complete the puzzle in fewer moves you get a positive score, otherwise you get a negative score.</p>
  </div>
  
  <h2>Play the game</h2>
  <div id="div_table_wrapper">
    <table id="table_stats">
      <thead><tr><th id="th_statistics" colspan="2">Statistics</th></th></thead>
      <tbody>
        <tr>
          <th class="stats">Rotations:</th>
          <td class="stats"><span id="span_rotate">0</span></td>
        </tr>
        <tr>
          <th class="stats">Locks:</th>
          <td class="stats"><span id="span_lock">0</span></td>
        </tr>
        <tr>
          <th class="stats">Par:</th>
          <td class="stats"><span id="span_par">0</span></td>
        </tr>
        <tr>
          <th id="th_score" class="stats">Score:</th>
          <td id="td_score" class="stats"><span id="span_score">0</span></td>
        </tr>
      </tbody>
    </table>
    <table id="table_settings">
      <thead><tr><th id="th_settings">Settings</th></th></thead>
      <tbody>
        <tr><td><button id="button_graphics"  class="tangles_button">Change graphics</button></td></tr>
        <tr><td><button id="button_help"      class="tangles_button">Toggle help</button></td></tr>
        <tr><td><button id="button_autosolve" class="tangles_button">Autosolve</button></td></tr>
        <tr><td id="td_sliders"><button id="button_sliders" class="tangles_button">Toggle scrollbars</button></td></tr>
      </tbody>
    </table>
    <table id="table_level">
      <thead><tr><th id="th_level">Level</th></th></thead>
      <tbody>
        <tr><td><button id="button_reset" class="tangles_button">Reset all progress</button></td></tr>
        <tr><td id="td_level">Current level: <span id="span_level"></span></td></tr>
      </tbody>
    </table>
  </div>
  
  <div class="blurb">
    <div class="center">
      <canvas id="canvas_tangles" width="2000" height="2000"></canvas>
    </div>
    
    
  </div>

  <div id="div_debug"></div>
  
  <img src="<?=$_SERVER['HTTP_PREFIX']?>/images/tangles.png" style="display:none"/>
</div>

<?php foot() ; ?>
