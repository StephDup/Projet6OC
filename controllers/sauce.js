const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
    .catch(error => res.status(400).json({ error }));
}

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
  { 
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(201).json({ message: 'Sauce modifiée !'}))
    .catch(error => res.status(400).json({ error }));
}

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(201).json({ message: 'Sauce supprimée !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
}

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (req.body.like == 0) {
        if (sauce.usersLiked.includes(req.body.userId)) {
          sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1);
          sauce.likes -= 1;
        }
        if (sauce.usersDisliked.includes(req.body.userId)) {
          sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId), 1);
          sauce.dislikes -= 1;
        }
      } else if (req.body.like == -1 || req.body.like == 1) {
        if (!(sauce[req.body.like == -1 ? 'usersDisliked' : 'usersLiked'].includes(req.body.userId))) {
          sauce[req.body.like == -1 ? 'usersDisliked' : 'usersLiked'].push(req.body.userId);
          sauce[req.body.like == -1 ? 'dislikes' : 'likes'] += 1;
          if (sauce[req.body.like == -1 ? 'usersLiked' : 'usersDisliked'].includes(req.body.userId)) {
            sauce[req.body.like == -1 ? 'usersLiked' : 'usersDisliked'].splice(sauce[req.body.like == -1 ? 'usersLiked' : 'usersDisliked'].indexOf(req.body.userId), 1);
            sauce[req.body.like == -1 ? 'likes' : 'dislikes'] -= 1;
          }
        }
      }
      sauce.save()
      .then(() => res.status(201).json({ message: 'Like/Dislike envoyé !' }))
      .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(404).json({ error }));
}

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
}

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
}