<?php
include_once($_SERVER['FILE_PREFIX']."/project_list/project_object.php") ;
$github_uri   = "https://github.com/aidansean/tangles" ;
$blogpost_uri = "http://aidansean.com/projects/?tag=tangles" ;
$project = new project_object("tangles", "Tangles", "https://github.com/aidansean/tangles", "http://aidansean.com/projects/?tag=tangles", "tangles/images/project.jpg", "tangles/images/project_bw.jpg", "I love to create games and I try to keep up with the latest web based technology to create open source games.  When it became clear that all the modern browsers support the canvas I decided to create this game to see what I could make.  It's a clone of similar games such as Loops of Zen.", "Games", "canvas,CSS,HTML,JavaScript") ;
?>