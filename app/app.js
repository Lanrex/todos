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
  },
  onBeforeAction: function(){
    if (Meteor.userId()){
      this.next();
    }
    else{
      this.render('login');
    }
  }
});

Router.configure({
  layoutTemplate: 'main'
});

if(Meteor.isClient){
  // client code goes here

  Template.todos.helpers({
    'todo': function(){
        return Todos.find({listId: this._id, createdBy: Meteor.userId()}, {sort: {createdAt: -1}});
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
        createdBy: Meteor.userId(),
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
        name: listName,
        createdBy: Meteor.userId()
      }, function(error, results){
        Router.go('listPage', {_id: results});
      });
      $('[name=listName]').val('');
    }
  });

  Template.lists.helpers({
    'list': function(){
      return Lists.find({createdBy: Meteor.userId()}, {sort: {name:1}});
    }
  });

  Template.register.events({
    'submit form': function(event){
      event.preventDefault();
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      Accounts.createUser({
        email: email,
        password: password
      }, function(error){
        if (error){
          console.log(error.reason);
        }
        else{
          Router.go('home');
        }
      });
    }
  });

  Template.navigation.events({
    'click .logout': function(event){
      event.preventDefault();
      Meteor.logout();
      Router.go('login');
    }
  });

  Template.login.events({
    'submit form': function(event){
      event.preventDefault();
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      Meteor.loginWithPassword(email, password, function(error){
        if (error){
          console.log(error.reason);
        }
        else{
          var currentRoute = Router.current().route.getName();
          if (currentRouter == 'login'){
            Router.go('home');
          }
        }
      });
    }
  });

}

if(Meteor.isServer){
    // server code goes here
}
