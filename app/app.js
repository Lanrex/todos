Todos = new Mongo.Collection('todos');


if(Meteor.isClient){
  // client code goes here

  Template.todos.helpers({
    'todo': function(){
        return Todos.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.addTodo.events({
    /// events go here
    'submit form': function(event){
      event.preventDefault();
      var todoName = $('[name="todoName"]').val();
      Todos.insert({
        name: todoName,
        completed: false,
        createdAt: new Date()
      });
      $('[name="todoName"]').val('');
    }
  });

  Template.todoItem.events({
    'click .delete-todo': function(event){
      event.preventDefault();
      var confirm = window.confirm("Delete this task?");
      if (confirm){
        Todos.remove({_id : this._id});
      }
    },

    'keyup [name=todoItem]': function(event){
      if (event.which == 13 || event.which == 27){
        $(event.target).blur();
      }
      else{
        Todos.update({_id : this._id}, {$set : {name: $(event.target).val()}});
      }
    },

    'change [type=checkbox]': function(){
      if (this.completed){
        Todos.update({_id : this._id},{$set : {completed: false}});
      }
      else{
        Todos.update({_id : this._id},{$set : {completed: true}});
      }
    }
  });

  Template.todoItem.helpers({
    'checked' : function(){
      if (this.completed){
        return "checked";
      }
      else{
        return "";
      }
    }
  });

  Template.todosCount.helpers({
    'totalTodos': function(){
        // code goes here
        return Todos.find().count();
    },
    'completedTodos': function(){
        // code goes here
        return Todos.find({completed : true}).count();
    }
  });



}

if(Meteor.isServer){
    // server code goes here
}
