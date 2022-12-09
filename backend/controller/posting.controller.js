const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Listing = require('../models/Listing');
const Tag = require('../models/Tag');

exports.searchPosts = async (req, res, next) => {
  const { category, type, radius, keyword, page } = req.body;
  try {
    const total = await Listing.countDocuments();
    const query = Listing.find();
    if(category !== '') {
      const cate = await Category.findOne({ title: category });
      const categoryId = cate._id;
      const subCategories = await Subcategory.find({ categoryId }).lean();
      query.where('subcategoryId').in(subCategories.map(subCategory => subCategory._id))
    }
    if(type !== '') {
      query.where('listingType', type);
    }
    if(keyword !== '') {
      query.or([
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ]);
    }
    query.skip(page * 12 - 12).limit(12);
    const lists = await query.exec();
    res.send({ total, posts: lists })
  }
  catch(err) {
    console.log('filter error:', err);
    next(err);
  }
}

exports.createPost = async (req, res, next) => {
  let uploadFile = req.file;
  let tagId = [];
  try {
    if(req.body.tags && req.body.tags.length > 0) {
      for(let i=0; i<req.body.tags.length; i++) {
        let tag = await Tag.findOne({ title: req.body.tags[i] });
        if(tag) tagId.push(tag._id);
        else {
          let newTag = await Tag.create({
            title: req.body.tags[i]
          })
          tagId.push(newTag._id)
        }
      }
    }
    const listing = await Listing.create({
      title: req.body.title,
      price: req.body.price,
      listingType: req.body.type,
      photo: uploadFile ? uploadFile.filename : null,
      userId: req.user._id,
      subcategoryId: req.body.subCategory,
      description: req.body.description,
      tags: tagId,
      profileId: req.user.profileId,
    })
    res.send(listing);
  }
  catch(err) {
    console.log('upload error:', err);
    next(err);
  }
}

exports.getByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const postings = await Listing.find({ userId });
    res.send(postings);
  }
  catch(err) {
    next(err);
  }
}
