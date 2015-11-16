Todos = new Mongo.Collection('todos');
Lists = new Mongo.Collection('lists');

Router.route('/',{
  template: 'home',
  name: 'home'
});
Router.route('/register');
Router.route('/login');
Router.route('/list/:_id',{
  template: 'listPage',
  name: 'listPage',
  data: function(){
      return Lists.findOne({_id: this.params._id});
  }
});

Router.configure({
  layoutTemplate: 'main'
});

if(Meteor.isClient){
  // client code goes here

  Template.todos.helpers({
    'todo': function(){
        return Todos.find({listId: this._id}, {sort: {createdAt: -1}});
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
        createdAt: new Date(),
        listId: this._id
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
        return Todos.find({listId: this._id}).count();
    },
    'completedTodos': function(){
        // code goes here
        return Todos.find({completed : true, listId: this._id}).count();
    }
  });

  Template.addList.events({
    'submit form': function(event){
      event.preventDefault();
      var listName=$('[name=listName]').val();
      Lists.insert({
        name: listName
      }, function(error, results){
        Router.go('listPage', {_id: results});
      });
      $('[name=listName]').val('');
    }
  });

  Template.lists.helpers({
    'list': function(){
      return Lists.find({}, {sort: {name:1}});
    }
  });

}

if(Meteor.isServer){
    // server code goes here
}
