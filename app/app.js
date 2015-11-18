Todos = new Mongo.Collection('todos');
Lists = new Mongo.Collection('lists');

Router.route('/',{
  template: 'home',
  name: 'home',
  waitOn: function(){
    return Meteor.subscribe('lists');
  }
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
  },
  waitOn: function(){
    return [ Meteor.subscribe('lists'), Meteor.subscribe('todos', this.params._id)];
  }
});

Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'loading'
});

if(Meteor.isClient){
  // client code goes here

  $.validator.setDefaults({
    rules: {
      password: {
        minlength: 6,
        required: true
      },
      email: {
        required: true,
        email: true
      }
    },
    messages: {
      email: {
        required: "Enter an email adress.",
        email: "Invalid email adress."
      },
      password: {
        required: "Provide a password.",
        minlength: "Passwords are at least {0} characters long."
      }
    }
  });

  Template.login.onRendered(function(){
    var validator= $('.login').validate({
      submitHandler: function(event){
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(error){
          if (error){
            if(error.reason == "User not found"){
                validator.showErrors({
                    email: error.reason
                });
            }
            if(error.reason == "Incorrect password"){
                validator.showErrors({
                    password: error.reason
                });
            }
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
  });

  Template.register.onRendered(function(){
    var validator = $('.register').validate({
        submitHandler: function(event){
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Accounts.createUser({
                email: email,
                password: password
            }, function(error){
                if(error){
                  if(error.reason == "Email already exists."){
                      validator.showErrors({
                          email: "That email already belongs to a registered user."
                      });
                  }
                } else {
                    Router.go("home");
                }
            });
        }
    });
  });

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
      var listId = this._id;
      Meteor.call('createListItem', todoName, listId, function(error, results){
        if (error){
          console.log(error.reason);
        }
        else{
          $('[name="todoName"]').val("");
        }
      });
      /*
      Todos.insert({
        name: todoName,
        completed: false,
        createdAt: new Date(),
        createdBy: Meteor.userId(),
        listId: this._id
      });
      $('[name="todoName"]').val('');
      */
    }
  });

  Template.todoItem.events({
    'click .delete-todo': function(event){
      event.preventDefault();
      var confirm = window.confirm("Delete this task?");
      if (confirm){
        Meteor.call('removeListItem', this._id);
        //Todos.remove({_id : this._id});
      }
    },

    'keyup [name=todoItem]': function(event){
      if (event.which == 13 || event.which == 27){
        $(event.target).blur();
      }
      else{
        var todoId = this._id;
        var name = $(event.target).val();
        //Todos.update({_id : this._id}, {$set : {name: $(event.target).val()}});
        Meteor.call('updateListItem', todoId, name);
      }
    },

    'change [type=checkbox]': function(){
      var todoId = this._id;
      var completed = this.completed;
      Meteor.call('changeItemStatus', todoId, completed);
      /*
      if (this.completed){
        Todos.update({_id : this._id},{$set : {completed: false}});
      }
      else{
        Todos.update({_id : this._id},{$set : {completed: true}});
      }
      */
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
      Meteor.call('createNewList', listName, function(error, results){
        if (error){
          console.log(error.reson);
        }
        else{
          Router.go('listPage', {_id: results});
          $('[name=listName]').val('');
        }
      });
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
      /*
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
      */
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
      /*
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
      */
    }
  });

}

if(Meteor.isServer){
    // server code goes here
    Meteor.publish('lists', function(){
      return Lists.find({createdBy: this.userId});
    });

    Meteor.publish('todos', function(currentList){
      return Todos.find({createdBy: this.userId, listId: currentList});
    });

    Meteor.methods({
      'createNewList': function(listName){
        var currentUser = Meteor.userId();
        //check(listName, String);
        if (listName == ""){
          listName= defaultName(currentUser);
        }
        var data = {
          name: listName,
          createdBy: currentUser
        };
        if (!currentUser){
          throw new Meteor.Error("not-logged-in", "You're not logged in.");
        }
        return Lists.insert(data);
      },

      'createListItem': function(todoName, listId){
        //check(todoName, String);
        //check(listId, String);
        var data = {
          name: todoName,
          completed: false,
          createdAt: new Date(),
          createdBy: Meteor.userId(),
          listId: listId
        };
        if (!Meteor.userId()){
          throw new Meteor.Error("not-logged-in", "You're not logged in.");
        }
        if (Lists.findOne(listId).createdBy != Meteor.userId()){
          throw new Meteor.Error("invalid user", "You don't own that list.");
        }
        return Todos.insert(data);
      },

      'updateListItem': function(todoId, name){
        //check(name, String);
        var currentUser = Meteor.userId();
        if (!currentuser){
          throw new Meteor.Error("not-logged-in", "You're not logged in.");
        }
        return Todos.update({_id : todoId}, {$set : {name: name}});
      },

      'changeItemStatus': function(todoId, completed){
        //check(completed, Boolean);
        if (!Meteor.userId()){
          throw new Meteor.Error("not-logged-in", "You're not logged in.");
        }
        Todos.update({_id : todoId},{$set : {completed: !completed}});
      },

      'removeListItem': function(id){
        if (!Meteor.userId()){
          throw new Meteor.Error("not-logged-in", "You're not logged in.");
        }
        return Todos.remove({_id : id});
      }
    });

    function defaultName(currentUser){
      var nextLetter = 'A'
      var nextName = 'List ' + nextLetter;
      while (Lists.findOne({ name: nextName, createdBy: currentUser })) {
          nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
          nextName = 'List ' + nextLetter;
      }
      return nextName;
    }
}
