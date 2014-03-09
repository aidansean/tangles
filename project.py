from project_module import project_object, image_object, link_object, challenge_object

p = project_object('tangles', 'Tangles')
p.domain = 'http://www.aidansean.com/'
p.path = 'indigo'
p.preview_image_ = image_object('http://placekitten.com.s3.amazonaws.com/homepage-samples/408/287.jpg', 408, 287)
p.github_repo_name = 'tangles'
p.mathjax = True
p.links.append(link_object(p.domain, 'tangles', 'Live page'))
p.introduction = 'I love to create games and I try to keep up with the latest web based technology to create open source games.  When it became clear that all the modern browsers support the canvas I decided to create this game to see what I could make.  It\'s a clone of similar games such as Loops of Zen.'
p.overview = '''This is one of the first projects I made where the user interacts with a grid of squares on the canvas.  The aim of the game is to link up the network of pieces by rotating the squares.  Given that the game is so simple it did not take long to create.'''

p.challenges.append(challenge_object('The game needed a simple grid layout that was easy to control.', 'This was one of the first projects I made that had a gridlike interface on the canvas, and this model became used a lot elsewhere.  One of the users asked for scroll bars for the larger levels, and this took a few iterations to get right.  In the end I was satisfied with how they work, but I would feel better if they were also draggable.', 'Resolved'))

p.challenges.append(challenge_object('The game is very simple, so it should have elegant style.', 'I very much enjoyed creating the styles for this game, with the simple choice of colours, and simple arc paths.  The code that makes the arcs is simple enough to edit quickly, but also complex enough that it took a while to assemble.', 'Resolved'))

p.challenges.append(challenge_object('One of the features is the "autosolve" function.', 'Once I made this game I became fascinated with finding the optimal solution, so I wrote a function that tries to solve the game.  It works through the cells one by one and in each iteration it identifies squares that can only be oriented in one way, and fixes them in place.  The algorithm gives up when it completes an iteration without making any changes.  So far all tests have shown that it completes as much of the level as puzzle before coming to a degenerate case which has two or more valid solutions.  At that point the user can intervene to resolve the degeneracy, and start the autosolver again.', 'Resolved'))

