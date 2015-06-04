BooksList=new Mongo.Collection('books')


if(Meteor.isClient){

  Meteor.subscribe('theBooks');

  Template.board.helpers({
    'book': function(){
      var currentUserId = Meteor.userId();
      return BooksList.find({}, {sort: {score: -1, name: 1}});
    },
    'selectedClass': function(){
      var bookId = this._id;
      var selectedBook = Session.get('selectedBook');
      if(bookId == selectedBook){
          return "selected"
      }
    },
    'showSelectedBook': function(){
      var selectedBook = Session.get('selectedBook');
      return BooksList.findOne(selectedBook)
    }
  });

  Template.board.events({
    'click .book': function(){
      var bookId = this._id;
      Session.set('selectedBook', bookId);
    },
    'click .increment': function(){
      var selectedBook = Session.get('selectedBook');
      Meteor.call('modifyBookScore', selectedBook, 5);
    },
    'click .decrement': function(){
      var selectedBook = Session.get('selectedBook');
      Meteor.call('modifyBookScore', selectedBook, -5);
    },
    'click .remove': function(){
      var selectedBook = Session.get('selectedBook');
      Meteor.call('removeBookData', selectedBook);
    }
  });

  Template.addBookForm.events({
    'submit form': function(event){
      event.preventDefault();
      var bookNameVar = event.target.bookName.value;
      Meteor.call('insertBookData', bookNameVar);
    }
  });

}

if(Meteor.isServer){

  Meteor.publish('theBooks', function(){
    var currentUserId = this.userId;
    return BooksList.find({createdBy: currentUserId})
  });

  Meteor.methods({
    'insertBookData': function(bookNameVar){
      var currentUserId = Meteor.userId();
      BooksList.insert({
          name: bookNameVar,
          score: 0,
          createdBy: currentUserId
      });
    },
    'removeBookData': function(selectedBook){
      var currentUserId = Meteor.userId();
      BooksList.remove({_id: selectedBook, createdBy: currentUserId});
    },
    'modifyBookScore': function(selectedBook, scoreValue){
      var currentUserId = Meteor.userId();
      BooksList.update( {_id: selectedBook, createdBy: currentUserId},
                          {$inc: {score: scoreValue} });
    }
  });

}