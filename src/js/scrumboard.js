scrum = {
	task_id: 10000,
	default_user_name: 'User',
	default_task_name: 'Task'
};

// -- API Methods --

// To be edited
scrum.changeStatus = function(task) {
	console.log(task);
	console.log('Task Moved: [task_id: "' + task.task_id + '" task_name: "' + task.task_name + '" project_id: "' + task.project_id + '" user_name: "' + task.user_name + '" status: "' + task.status + '"]');	
}

scrum.taskCreated = function(task) {
	console.log('Task Created: [task_id: "' + task.task_id + '" task_name: "' + task.task_name + '" project_id: "' + task.project_id + '" user_name: "' + task.user_name + '"]');
}

// TODO: change to array
scrum.taskEdited = function(task) {
	console.log('Task Edited: [task_id: "' + task_id + '" task_name: "' + task_name + '" project_id: "' + project_id + '" user_name: "' + user_name + '"]');
}
// TODO: make and call
scrum.taskDeleted = function() {

}

scrum.editMode = function(ui) {
	if(!$(ui).hasClass('scrum_task_edit')) {
		$(ui).addClass('scrum_task_edit');

		// Save old state
		var old_html = $(ui).html();

		// Create textboxes
		var name_editor = $('<input>', {
			type: 'textbox',
			class: 'name',
			value: $('p.name', ui).html()
		});

		var user_editor = $('<input>', {
			type: 'textbox',
			class: 'user',
			value: $('p.user', ui).html()
		});

		// Escape edit mode without saving
		var escape_action = function(e) {
			if(e.keyCode == 27) {
				$(ui).html(old_html);
				$(ui).removeClass('scrum_task_edit');
			}
		};

		// Escape edit mode saving
		var enter_action = function(e) {
			if(e.keyCode == 13) {
				var p_name = $('<p>', {
					class: 'name',
					text: name_editor.val()
				});
				var p_user = $('<p>', {
					class: 'user',
					text: user_editor.val()
				});
				$(ui).html(p_name);
				$(ui).append(p_user);
				$(ui).removeClass('scrum_task_edit');
				
				// Throw event
				scrum.taskEdited({
					task_id: $(ui).attr('id'), 
					task_name: p_name.html(),
					project_id: $(ui).parent('.scrum_project').attr('id'),
					user_name: p_user.html()
				});
			}
		};

		// Bind events and append elements
		name_editor.keyup(escape_action);
		name_editor.keyup(enter_action);

		user_editor.keyup(escape_action);
		user_editor.keyup(enter_action);

		$(ui).html(name_editor);
		$(ui).append(user_editor);

		name_editor.focus();
	}
}

// -- jQuery Methods --

$.fn.scrum = function() {
	var local = this;
	// Create structure
	$(this).append($('<div>', {class: 'scrum_project_header'}))
	.append($('<div>', {class: 'scrum_column_header'}).append($('<div>', {
			class: 'scrum_column_title',
			id: 'todo',
			text: 'A fazer'
		}))
		.append($('<div>', {
			class: 'scrum_column_title',
			id: 'ongoing',
			text: 'Em execução'
		}))
		.append($('<div>', {
			class: 'scrum_column_title',
			id: 'done',
			text: 'Concluído'
		}).click(function() {
			$(local).scrum.removeDoneTasks();
		}))
		.append($('<div>', {
			class: 'scrum_column_title',
			id: 'problem',
			text: 'Problema'
		}))
	)
	.append($('<div>', {class: 'scrum_container'})
		.append($('<div>', {
			class: 'scrum_column',
			id: 'todo'
		}))
		.append($('<div>', {
			class: 'scrum_column',
			id: 'ongoing'
		}))
		.append($('<div>', {
			class: 'scrum_column',
			id: 'done'
		}))
		.append($('<div>', {
			class: 'scrum_column',
			id: 'problem'
		}))
   );
	
	// For HTML added scrum tasks and projects
	var scrum_task = $('.scrum_task', this);
	var scrum_project = $('.scrum_project', this);

	// -- DRAG AND DROP --
	scrum_task.draggable({
		containment: '.scrum_container',
		revert: 'invalid'
	});

	scrum_project.droppable({
		accept: function(ui) {
			return (ui.parent().attr('id') == $(this).attr('id'));
		},
		drop: function(e, ui) {
			scrum.changeStatus({
				task_id: $(ui.draggable).attr('id'),
				task_name: $('#' + task_id + '> .name').html() || $('#' + task_id + '> .name').val(),
				user_name: $('#' + task_id + '> .user').html() || $('#' + task_id + '> .user').val(),
				project_id: $(this).attr('id'),
				status: $(this).parent('.scrum_column').attr('id')
			});
		}
	});

	// -- EDITING --
	$(document).on('dblclick', '.scrum_task', function() {
		scrum.editMode(this);
	});
	
	return this;
}

$.fn.scrum.addTask = function(task_id, task_name, project_id, user_name, status_id) {
	if(!status_id) status_id = 'todo';
	
	var container = $('#' + status_id + '.scrum_column > #' + project_id + '.scrum_project', this);
	// Before anything: if on task limit, deny
	if(container.children('.scrum_task').length >= 8) return false;
	
	var project_title = $('#' + project_id + '.scrum_project_title');
	
	var task = $('<div>', {
		id: task_id,
		style: 'background-color: ' + project_title.css('background-color') + '; color: ' + project_title.css('color') + ';',
		class: 'scrum_task'
	});

	var p_name = $('<p>', {
		class: 'name',
		text: task_name
	});

	var p_user = $('<p>', {
		class: 'user',
		text: user_name
	});

	task.append(p_name);
	task.append(p_user);

	task.draggable({
		containment: '.scrum_container',
		revert: 'invalid'
	});
	
	container.append(task);
	
	// Make "responsive"
	if(container.children('.scrum_task').length > 4) {
		container.children('.scrum_task').css('margin-bottom', '-35px');
	}
	// Throw event
	scrum.taskCreated({
		task_id: task_id,
		task_name: task_name,
		project_id: project_id,
		user_name: user_name
	});
	
	return task;
};

$.fn.scrum.removeTask = function(task_id) {
	$('#' + task_id + '.scrum_task', this).remove();
	return this;
};

$.fn.scrum.removeAllTasks = function() {
	$('.scrum_task', this).remove();
	return this;
};

$.fn.scrum.removeDoneTasks = function() {
	$('#done.scrum_column .scrum_task', this).remove();
	return this;
};

$.fn.scrum.addProject = function(project_id, project_name, bg_color, text_color) {
	var local = this;
	if(!bg_color) bg_color = 'white';
	if(!text_color) text_color = 'black';
	
	// Create header
	$('.scrum_project_header', this).append($('<div>', {
		id: project_id,
		class: 'scrum_project_title',
		style: 'background-color: ' + bg_color + '; color: ' + text_color + ';',
		text: project_name
	}).click(function() {
		scrum.editMode(local.addTask('task_' + scrum.task_id, scrum.default_task_name, project_id, scrum.default_user_name));
		scrum.task_id++;
	}));
	
	// Create column fields
	$('.scrum_column', this).append($('<div>', {
		id: project_id,
		class: 'scrum_project'
	}));
	
	// Make droppable
	$('#' + project_id + '.scrum_project', this).droppable({
		accept: function(ui) {
			return (ui.parent().attr('id') == project_id) && ($(this).children('.scrum_task').length < 8);
		},
		drop: function(e, ui) {
			var task_id = $(ui.draggable).attr('id');
			var status = $(this).parent().attr('id');
			$(ui.draggable).css('left', 0);
			$(ui.draggable).css('top', 0);
			$(this).append($(ui.draggable));
			if($(this).children('.scrum_task').length > 4) {
				$(this).children('.scrum_task').css('margin-bottom', '-35px');
			} else {
				$(this).children('.scrum_task').css('margin-bottom', '3px');
			}
			scrum.changeStatus({
				task_id: task_id,
				task_name: $('#' + task_id + '> .name').html() || $('#' + task_id + '> .name').val(),
				user_name: $('#' + task_id + '> .user').html() || $('#' + task_id + '> .user').val(),
				project_id: $(this).attr('id'),
				status: status
			});
		}
	});
	
	return this;
}

// Parse projects with tasks JSON
$.fn.scrum.parseJSON = function(json) {
	var scrum = this;
	$.each(eval(json), function(i, project) {
		$.each(project.tasks, function(i, task) {
			scrum.addTask(task.task_id, task.task_name, project.project_id, task.user_name, task.status);
		});
	});
};

// Return projects with tasks JSON
$.fn.scrum.getJSON = function() {
	var local = this;
	var return_array = new Array();
	$('#todo.scrum_column > .scrum_project', local).each(function(){
		var project_id = $(this).attr('id');
		var task_array = new Array();
		$('#' + project_id + '> .scrum_task', local).each(function(i, v) {
			var name = $('.name', this);
			var user = $('.user', this);
			task_array.push({
				task_id: $(this).attr('id'),
				// Get values from editMode tasks
				task_name: $('.name', this).html() || $('.name', this).val(),
				user_name: $('.user', this).html() || $('.user', this).val(),
				status: $(this).parents('.scrum_column').attr('id')
			});
		});
		return_array.push({
			project_id: project_id,
			project_name: $('#' + project_id + '.scrum_project_title').html(),
			tasks: task_array
		});
	});
	return JSON.stringify(return_array);
};