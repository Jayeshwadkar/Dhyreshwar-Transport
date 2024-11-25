const Branch = require("../models/Branch");
const Place = require("../models/Place");
const Employee = require("../models/Employee");
const Article = require("../models/Article");
const Customer = require("../models/Customer");
const Driver = require("../models/Driver");
const Supplier = require("../models/Supplier");
const VehicleType = require("../models/VehicleType");
const Vehicle = require("../models/Vehicle");
const Bank = require("../models/Bank");
const BankAccount = require("../models/BankAccount");
const RateMaster = require("../models/RateMaster");
const TransactionPrefix = require("../models/TransactionPrefix");
const LorryReceipt = require("../models/LorryReceipt");
const ExcelJS = require("exceljs");
const { ObjectId } = require("mongodb");
const db = require('../database/db')
// Add a branch

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const addBranch = async (req, res, next) => {
  try {
    const { branchCode, abbreviation, name, description, place, balanceType, openingBalance } = req.body
    const query = 'CALL addbranch(?,?,?,?,?,?,?,@message)'
    const result = await db.query(query, [
      branchCode?.trim?.(),
      abbreviation?.trim?.(),
      name?.trim?.(),
      description?.trim?.(),
      place,
      openingBalance?.trim?.(),
      balanceType?.trim?.(),
    ])
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      return res.status(200).json(result[0][0][0])
    }
  } catch (error) {
    console.log("Error in getting branches", error);
    return res.status(500).json(error)
  }
};

// Get all branches (100 branches)
const getBranches = async (req, res, next) => {
  // Branch.find({ active: true })
  //   .sort("-createdAt")
  //   .exec((error, branches) => {
  //     if (error) {
  //       return res.status(200).json({
  //         message: "Error fetching branches!",
  //       });
  //     } else {
  //       res.json(branches);
  //     }
  //   });
  try {
    const query = `CALL getallbranches()`
    const result = await db.query(query)
    if (result) {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {
    console.log("Error in get all branches : ", error)
    return res.status(500).json(error)
  }
};

const getBranchesListByPage = async (req, res, next) => {
  try {
    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    const query = 'CALL getbrancheslistbypage(?,?)'
    const result = await db.query(query, [start_index, counts])
    let branches = result[0][0]
    const total = branches.length > 0 ? branches[0].total_count : 0
    if (branches) {
      if (branches.length > 0) {

        return res.json({
          branches: branches,
          total: total
        });
      } else {
        return res.status(200).json({
          branches: [],
          total: 0,
          message: "No Data In Branch"
        })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting branches", error);
    return res.status(500).json(error)
  }
};

// Get all branches by search (100 branches)
const getBranchesBySearch = async (req, res, next) => {
  console.log(req.body)
  try {
    const { filterData } = req.body.temp

    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const offset = page * pageSize;

    const query = 'CALL getbrancheslistbysearch(?)'
    const result = await db.query(query, [filterData.trim()])
    let branches = result[0][0]
    const total = branches.length > 0 ? branches[0].total_count : 0
    if (branches) {
      if (branches.length > 0) {
        const paginatedarticles = branches.slice(offset, offset + pageSize);
        return res.json({
          branches: paginatedarticles,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting branches", error);
    return res.status(500).json(error)
  }
};

// Get all branches (100 branches)
const getBranchList = (req, res, next) => {
  Branch.aggregate([
    { $match: { active: true } },
    {
      $addFields: {
        placeId: { $toObjectId: "$place" },
      },
    },
    {
      $lookup: {
        from: "place",
        localField: "placeId",
        foreignField: "_id",
        as: "place",
      },
    },
    { $unwind: { path: "$place", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        place: "$place.name",
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        branchCode: 1,
        abbreviation: 1,
        name: 1,
        place: 1,
        description: 1,
      },
    },
  ]).exec((error, branches) => {
    if (error) {
      return res.status(200).json({
        message: "Error fetching branches!",
      });
    } else {
      res.json(branches);
    }
  });
};

// Get a branch
const getBranch = async (req, res, next) => {
  const branchId = req.params.id
  try {
    const query = 'CALL getbranchbyid(?)'
    const result = await db.query(query, branchId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching branch data" })
    }
    return res.status(200).json(result[0][0][0])
  } catch (error) {
    console.log("Internal Server Error")
    return res.status(500).json(error)
  }
};

// Remove a branch
const removeBranch = async (req, res, next) => {
  try {
    const id = req.params.id
    const query = 'CALL softdeletebranch(?,@message)'
    const result = await db.query(query, id)
    if (!result && !result[0]) {
      return res.status(200).json({ message: "Error in delete branch" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Error in delete branch", error)
    return res.status(500).json(error)
  }
};

// Update a branch
const updateBranch = async (req, res, next) => {
  try {
    const { branch_id, branch_code, branch_abbreviation, branch_name, description, place_id, opening_bal, opening_bal_type } = req.body
    const query = 'CALL updatebranch(?,?,?,?,?,?,?,?,@message)'
    const result = await db.query(query, [branch_id, branch_code, branch_abbreviation, branch_name, description, place_id, opening_bal || null, opening_bal_type])
    if (!result) {
      return res.status(200).json({ message: "Error in updating place" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    res.status(500).json(error)
  }
};

// Get places
const getPlaces = async (req, res, next) => {
  try {
    const query = 'CALL getallplaces()';
    const result = await db.query(query);
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Data not found" })
    } else {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {
    console.log("Error in getting places", error);
    return res.status(500).json(error)
  }
};

// Get place by page
const getPlacesListByPage = async (req, res, next) => {
  try {
    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    const query = 'CALL getplaceslistbypage(?,?)'
    const result = await db.query(query, [start_index, counts])
    let place = result[0][0]
    const total = place.length > 0 ? place[0].total_count : 0
    if (place) {
      if (place.length > 0) {

        return res.json({
          place: place,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting places", error);
    return res.status(500).json(error)
  }
};

// Get places By Search
const getPlacesBySearch = async (req, res, next) => {
  try {
    const { filterData } = req.body.temp

    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const offset = page * pageSize;

    const query = 'CALL getallplacesbysearch(?)'
    const result = await db.query(query, [filterData.trim()])
    let place = result[0][0]
    const total = place.length > 0 ? place[0].total_count : 0
    if (place) {
      if (place.length > 0) {
        const paginatedarticles = place.slice(offset, offset + pageSize);
        return res.json({
          place: paginatedarticles,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting places", error);
    return res.status(500).json(error)
  }
};

// Add a Place
const addPlace = async (req, res, next) => {
  try {
    const { name, abbreviation } = req.body
    const query = 'CALL addplace(?,?,@message)'
    const result = await db.query(query, [name.trim(), abbreviation])
    return res.status(200).json(result[0][0][0])
  } catch (error) {
    console.log("Internal Server Error")
    return res.status(500).json(error)
  }
};

// Remove a place
const removePlace = async (req, res, next) => {
  try {
    const id = req.params.id
    const query = 'CALL softdeleteplace(?,@message)'
    const result = await db.query(query, id)
    if (!result && !result[0]) {
      return res.status(200).json({ message: "Error in delete place" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Error in delete place", error)
    return res.status(500).json(error)
  }
};

// Update a place
const updatePlace = async (req, res, next) => {
  try {
    const { place_id, place_name, place_abbreviation } = req.body
    const query = 'CALL updateplace(?,?,?,@message)'
    const result = await db.query(query, [place_id, place_name, place_abbreviation])
    if (!result) {
      return res.status(200).json({ message: "Error in updating place" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    res.status(500).json(error)
  }
};

// Get a place
const getPlace = async (req, res, next) => {
  const placeId = req.params.id
  try {
    const query = 'CALL getplacebyid(?)'
    const result = await db.query(query, placeId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching place data" })
    }
    return res.status(200).json(result[0][0][0])
  } catch (error) {
    console.log("Internal Server Error")
    return res.status(500).json(error)
  }
};

// Add a employee
const addEmployee = async (req, res, next) => {
  try {
    const { name, correspondenceAddress, permanentAddress, dateOfBirth, mobile, email,
      joiningDate, qualification, bloodGroup, designation
    } = req.body

    const formattedDob = new Date(dateOfBirth).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formattedJoiningD = new Date(joiningDate).toLocaleDateString('en-IN').split('/').reverse().join('-');

    const query = 'CALL addemployee(?,?,?,?,?,?,?,?,?,?,@message)'
    const result = await db.query(query, [
      name.trim(), correspondenceAddress, formattedDob, email, formattedJoiningD, permanentAddress,
      qualification, mobile, bloodGroup, designation
    ])
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      return res.status(200).json(result[0][0][0])
    }
  } catch (error) {
    console.log("Error in adding employee", error);
    return res.status(500).json(error)
  }
};

// Get 100 employees

const getEmployees = async (req, res, next) => {
  try {
    const query = 'CALL getallemployee()'
    const result = await db.query(query)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching place data" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error")
    return res.status(500).json(error)
  }
};

const getEmployeesForUserReg = async (req, res, next) => {
  try {
    const query = 'CALL emplistforuserreg()'
    const result = await db.query(query)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching place data" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error")
    return res.status(500).json(error)
  }
};


const getEmployeesByPage = async (req, res, next) => {
  try {
    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    const query = 'CALL getemployeelistbypage(?,?)'
    const result = await db.query(query, [start_index, counts])
    let employee = result[0][0]
    const total = employee.length > 0 ? employee[0].total_count : 0
    if (employee) {
      if (employee.length > 0) {

        return res.json({
          employee: employee,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting employees", error);
    return res.status(500).json(error)
  }
};

// Get 100 employees
const getEmployeesBySearch = async (req, res, next) => {
  try {
    const { filterData } = req.body.temp

    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const offset = page * pageSize;

    const query = 'CALL getemployeelistbysearch(?)'
    const result = await db.query(query, [filterData.trim()])
    let employee = result[0][0]
    const total = employee.length > 0 ? employee[0].total_count : 0
    if (employee) {
      if (employee.length > 0) {
        const paginatedarticles = employee.slice(offset, offset + pageSize);
        return res.json({
          employee: paginatedarticles,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting employees", error);
    return res.status(500).json(error)
  }
};

// Remove a employee
const removeEmployee = async (req, res, next) => {
  // if (!req.params.id) {
  //   return res.status(200).json({ message: "Employee ID is required!" });
  // }

  // Employee.findByIdAndUpdate(
  //   req.params.id,
  //   {
  //     $set: {
  //       active: false,
  //       updatedBy: req.body.updatedBy,
  //     },
  //   },
  //   { new: true },
  //   (error, data) => {
  //     if (error) {
  //       res.status(200).json({ message: error.message });
  //     } else {
  //       res.json({ id: data._id });
  //     }
  //   }
  // );
  try {
    const id = req.params.id
    const query = 'CALL softdeleteemployee(?,@message)'
    const result = await db.query(query, id)
    if (!result && !result[0]) {
      return res.status(200).json({ message: "Error in delete employee" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Error in delete employee", error)
    return res.status(500).json(error)
  }
};

// Update a employee
const updateEmployee = async (req, res, next) => {
  try {
    const {
      emp_id, employee_name, corresp_address, date_of_birth, emailid, joining_date,
      permanat_address, qualification, mobileno, blood_group, designation
    } = req.body

    const formattedDob = new Date(date_of_birth).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formattedJoiningD = new Date(joining_date).toLocaleDateString('en-IN').split('/').reverse().join('-');

    const query = 'CALL updateemployee(?,?,?,?,?,?,?,?,?,?,?,@message)'
    const result = await db.query(query, [
      emp_id, employee_name, corresp_address, formattedDob, emailid, formattedJoiningD,
      permanat_address, qualification, mobileno, blood_group, designation
    ])
    if (!result) {
      return res.status(200).json({ message: "Error in updating employee" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    res.status(500).json(error)
  }
};

// Get a employee
const getEmployee = async (req, res, next) => {
  const employeeId = req.params.id
  try {
    const query = 'CALL getemployeebyid(?)'
    const result = await db.query(query, employeeId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching employee data" })
    }
    return res.status(200).json(result[0][0][0])
  } catch (error) {
    console.log("Internal Server Error")
    return res.status(500).json(error)
  }
};

// Get articles
const getArticles = async (req, res, next) => {
  // Article.find({ active: true })
  //   .sort("-createdAt")
  //   .exec((error, articles) => {
  //     if (error) {
  //       return res.status(200).json({
  //         message: "Error fetching articles!",
  //       });
  //     } else {
  //       res.json(articles);
  //     }
  //   });

  try {
    const query = `CALL getallarticles()`
    const result = await db.query(query)
    if (result) {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {
    console.log("Error in get all articles : ", error)
    return res.status(500).json(error)
  }
};
//GET EMAIL
const fetchemail = async (req, res, next) => {
  console.log("hiiihi")
  try {
    const query = `CALL getemailid()`
    const result = await db.query(query)
    console.log(result[0][0][0])
    if (result) {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {
    console.log("Error in get all articles : ", error)
    return res.status(500).json(error)
  }
};


// Get articles By Search
const getArticlesBySearch = async (req, res, next) => {
  try {
    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const offset = page * pageSize;

    const { filterData } = req.body.temp

    const query = 'CALL getarticleslistbysearch(?)'
    const result = await db.query(query, [filterData.trim()])
    let article = result[0][0]
    article = article.map(article => ({
      ...article,
      article_name: article.article_name ? article.article_name.toUpperCase() : null,
      description: article.description ? article.description.toUpperCase() : null,
    }));
    const total = article.length > 0 ? article[0].total_count : 0
    if (article) {
      if (article.length > 0) {
        const paginatedarticles = article.slice(offset, offset + pageSize);
        return res.json({
          article: paginatedarticles,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting articles", error);
    return res.status(500).json(error)
  }
};


const getArticlesByPage = async (req, res, next) => {
  try {

    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    const query = 'CALL getarticleslistbypage(?,?)'
    const result = await db.query(query, [start_index, counts])
    let article = result[0][0]
    article = article.map(article => ({
      ...article,
      article_name: article.article_name ? article.article_name.toUpperCase() : null,
      description: article.description ? article.description.toUpperCase() : null,
    }));
    const total = article.length > 0 ? article[0].total_count : 0
    if (article) {
      if (article.length > 0) {

        return res.json({
          article: article,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting articles", error);
    return res.status(500).json(error)
  }
};

// Get a article
const getArticle = async (req, res, next) => {
  const articleId = req.params.id
  try {
    const query = 'CALL getarticlebyid(?)'
    const result = await db.query(query, articleId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching article data" })
    }
    return res.status(200).json(result[0][0][0])
  } catch (error) {
    console.log("Internal Server Error")
    return res.status(500).json(error)
  }
};

// Add a article
const addArticle = async (req, res, next) => {
  try {
    const { articles_name, description } = req.body
    const query = 'CALL addarticle(?,?,@message)'
    const result = await db.query(query, [articles_name.trim(), description])
    if (result) {
      res.status(200).json(result[0][0][0])
    }
  } catch (error) {
    console.log("Internal Server Error", error)
    res.status(500).json(error)
  }
};

// Remove a article
const removeArticle = async (req, res, next) => {
  try {
    const id = req.params.id
    const query = 'CALL softdeletearticles(?,@message)'
    const result = await db.query(query, id)
    if (!result && !result[0]) {
      return res.status(200).json({ message: "Error in delete article" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Error in delete article", error)
    return res.status(500).json(error)
  }
};

// Update a Article
const updateArticle = async (req, res, next) => {
  try {
    const { articles_id, articles_name, description } = req.body
    const query = 'CALL updatearticles(?,?,?,@message)'
    const result = await db.query(query, [articles_id, articles_name, description])
    if (!result) {
      return res.status(200).json({ message: "Error in updating article" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    res.status(500).json(error)
  }
};

// Get customers
const getCustomers = async (req, res, next) => {
  try {
    const query = `CALL getallcustomers()`
    const result = await db.query(query)
    if (result) {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {
    console.log("Error in get all customer : ", error)
    return res.status(500).json(error)
  }

  // Customer.find({ active: true, }, {
  //   fax: 0,
  //   cstNo: 0,
  //   email: 0,
  //   vendorCode: 0,
  //   vatNo: 0,
  //   eccNo: 0,
  //   active: 0,
  //   contactPerson: 0,
  //   createdAt: 0,
  //   updatedAt: 0
  // })
  //   .sort("-createdAt").limit(20)
  //   .exec((error, customers) => {
  //     if (error) {
  //       return res.status(200).json({
  //         message: "Error fetching customers!",
  //       });
  //     } else {
  //       res.json(customers);
  //     }
  //   });
};

const getCustomersLimit = async (req, res, next) => {
  let escapedString = escapeRegExp(req.body.searchName);
  try {
    const query = `CALL getallcustomersLimit(?)`
    const result = await db.query(query, escapedString)
    if (result) {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {
    console.log("Error in get all customer : ", error)
    return res.status(500).json(error)
  }

  // Customer.find(
  //   {
  //     active: true, "name": {
  //       "$regex": new RegExp("^" + escapedString || "", "i")
  //     }
  //   }, {
  //   fax: 0,
  //   cstNo: 0,
  //   email: 0,
  //   vendorCode: 0,
  //   vatNo: 0,
  //   eccNo: 0,
  //   active: 0,
  //   contactPerson: 0,
  //   createdAt: 0,
  //   updatedAt: 0
  // })
  //   .sort("-createdAt")
  //   .limit(20)
  //   .exec((error, customers) => {
  //     if (error) {
  //       return res.status(200).json({
  //         message: "Error fetching customers!",
  //       });
  //     } else {
  //       res.json(customers);
  //     }
  //   });
};

// Get Customer by page
const getCustomersByPage = async (req, res, next) => {
  try {
    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    const query = 'CALL getcustomerlistbypage(?,?)'
    const result = await db.query(query, [start_index, counts])
    let customer = result[0][0]
    const total = customer.length > 0 ? customer[0].total_count : 0
    if (customer) {
      if (customer.length > 0) {

        return res.json({
          customer: customer,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting customers", error);
    return res.status(500).json(error)
  }
};

// Get customers By Search
const getCustomersBySearch = async (req, res, next) => {
  try {
    const { filterData } = req.body.temp

    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const offset = page * pageSize;

    const query = 'CALL getcustomerlistbysearch(?)'
    const result = await db.query(query, [filterData.trim()])
    let customer = result[0][0]
    const total = customer.length > 0 ? customer[0].total_count : 0
    if (customer) {
      if (customer.length > 0) {
        const paginatedarticles = customer.slice(offset, offset + pageSize);
        return res.json({
          customer: paginatedarticles,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting customers", error);
    return res.status(500).json(error)
  }
};

const downloadCustomers = async (req, res) => {
  console.log(req.body)
  try {
    const data = req.body.filterData
    const query = 'CALL get_customerforexcel(?)'
    const result = await db.query(query, data)
    if (result) {
      const printData = result[0][0].map((row, index) => ({
        index: index + 1,
        name: row.customer_name || "",
        city: row.city || ""
      }))

      try {
        const workbook = exportCustomerDataToXlsx(printData);

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "data.xlsx"
        );
        return workbook.xlsx.write(res).then(() => {
          res.status(200).end();
        }
        ).catch((err) => console.log(err));
      } catch (error) {
        console.log("Error in download customer", error)
        return res.status(500).json({ message: "Internal Server Error" })
      }
    }
  } catch (error) {
    console.log("Error : ", error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
};

const exportCustomerDataToXlsx = (data) => {

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Customers List");
  worksheet.columns = [
    { header: "Sr. no", key: "index" },
    { header: "Name", key: "name" },
    { header: "City", key: "city" },
  ];

  worksheet.addRows(data);
  return workbook;
};

const getCustomersByBranch = (req, res, next) => {
  if (!req.body.branchId) {
    return res.status(200).json({ message: "Branch ID is required" });
  }

  Customer.find({
    branch: req.body.branchId,
    active: true,
  }).exec((error, customers) => {
    if (error) {
      return res.status(200).json({
        message: "Error fetching customers!",
      });
    } else {
      res.json(customers);
    }
  });
};

// Get a customer
const getCustomer = async (req, res, next) => {
  const customerId = req.params.id
  try {
    const query = 'CALL getCustomerAndContactById(?)'
    const result = await db.query(query, customerId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching customer data" })
    }
    const finalObject = {
      customer: result[0][0],
      contact_person: result[0][1],
    }
    return res.status(200).json(finalObject)
  } catch (error) {
    console.log("Internal Server Error", error)
    return res.status(500).json(error)
  }
};

const getCustomerContactPerson = async (req, res, next) => {
  const customerId = req.params.id
  try {
    const query = 'CALL findcustomercontactperbyid(?)'
    const result = await db.query(query, customerId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching customer contact person data" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    return res.status(500).json(error)
  }
};

// Add a customer
const addCustomer = async (req, res, next) => {
  try {
    const {
      name, address, telephone, fax, cstNo, gstNo, state, city,
      email, vendorCode, vatNo, eccNo, branch,
      closingBalance, closingBalanceType, openingBalance, openingBalanceType, contactPerson
    } = req.body

    const query1 = 'CALL insertcustomer(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@message,@inserted_id)'
    const result1 = await db.query(query1, [
      name.trim(), address, telephone, fax, cstNo, gstNo, state, city,
      email, vendorCode, vatNo, eccNo,
      closingBalance, closingBalanceType, openingBalance, openingBalanceType
    ])

    const inserted_id = result1[0][1][0].inserted_id

    // name address designation email phone
    if (inserted_id != null && Array.isArray(contactPerson)) {
      const customerId = inserted_id;
      const query2 = 'call insertCustContPerDetails(?,?,?,?,?,?)'
      const promises = contactPerson.map((contact) => {
        return db.query(query2, [customerId, contact.person_name, contact.address, contact.designation, contact.emailid, contact.phone])
      })

      try {
        await Promise.all(promises);
        // console.log("All contact persons add successfully")
      } catch (error) {
        console.log("Error in adding contact perosn details", error)
      }
    }
    return res.status(200).json(result1[0][0][0])
  } catch (error) {
    console.log("Error in adding customer", error);
    return res.status(500).json(error)
  }
};

// Update a customer
const updateCustomer = async (req, res, next) => {
  try {
    const {
      customer_id, customer_name, address, telephoneno, faxno, cst, gstno, state, city,
      emailid, vendor_code, vatno, eccno, branch,
      closingbal, closingbaltype, openingbal, openingbaltype, contactPerson
    } = req.body

    const query1 = 'CALL updatecustomer(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@message)'
    const result1 = await db.query(query1, [
      customer_id, customer_name, address, telephoneno, faxno, gstno, city,
      emailid, vendor_code, state, cst, vatno, eccno,
      openingbal, openingbaltype, closingbal, closingbaltype
    ])

    const customerId = customer_id;

    // name address designation email phone
    if (customerId != null && Array.isArray(contactPerson)) {
      const query2 = 'call insertCustContPerDetails(?,?,?,?,?,?)'
      const promises = contactPerson.map((contact) => {
        return db.query(query2, [customerId, contact.person_name, contact.address, contact.designation, contact.emailid, contact.phone])
      })

      try {
        await Promise.all(promises);
        // console.log("All contact persons add successfully")
      } catch (error) {
        console.log("Error in updating contact perosn details", error)
      }
    }
    return res.status(200).json(result1[0][0][0])
  } catch (error) {
    console.log("Error in updating customer", error);
    return res.status(500).json(error)
  }
};

// Remove a customer
const removeCustomer = async (req, res, next) => {
  // if (!req.params.id) {
  //   return res.status(200).json({ message: "Customer ID is required!" });
  // }

  // Customer.findByIdAndRemove(req.params.id, (error, data) => {
  //   if (error) {
  //     res.status(200).json({ message: error.message });
  //   } else {
  //     res.json({ id: data._id });
  //   }
  // });

  try {
    const id = req.params.id
    const query = 'CALL softdeletecustomer(?,@message)'
    const result = await db.query(query, id)
    if (!result && !result[0]) {
      return res.status(200).json({ message: "Error in delete Customer" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Error in delete Customer", error)
    return res.status(500).json(error)
  }
};

// Get drivers
const getDrivers = async (req, res, next) => {
  try {
    const query = 'CALL getalldrivers()'
    const result = await db.query(query)
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Error in fetch all drivers : ", error)
    return res.status(500).send(error)
  }
};


// Get drivers by page
const getDriversByPage = async (req, res, next) => {
  try {
    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    const query = 'CALL getdriverlistbypage(?,?)'
    const result = await db.query(query, [start_index, counts])
    let driver = result[0][0]
    const total = driver.length > 0 ? driver[0].total_count : 0
    if (driver) {
      if (driver.length > 0) {

        return res.json({
          driver: driver,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting drivers", error);
    return res.status(500).json(error)
  }
};


// Get drivers by search
const getDriversBySearch = async (req, res, next) => {
  try {
    const { filterData } = req.body.temp

    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const offset = page * pageSize;

    const query = 'CALL getdriverlistbysearch(?)'
    const result = await db.query(query, [filterData.trim()])
    let driver = result[0][0]
    const total = driver.length > 0 ? driver[0].total_count : 0
    if (driver) {
      if (driver.length > 0) {
        const paginatedarticles = driver.slice(offset, offset + pageSize);
        return res.json({
          driver: paginatedarticles,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting drivers", error);
    return res.status(500).json(error)
  }
};

// Get a driver
const getDriver = async (req, res, next) => {
  const driverId = req.params.id
  try {
    const query = 'CALL getdriverbyid(?)'
    const result = await db.query(query, driverId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching driver data" })
    }
    return res.status(200).json(result[0][0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    return res.status(500).json(error)
  }
};

// Add a driver
const addDriver = async (req, res, next) => {
  try {
    const { name, correspondenceAddress, permanentAddress, dateOfBirth, telephone,
      fatherName, referencedBy, eyeSight, licenseNo, licenseType, qualification, joiningDate,
      bloodGroup, renewDate, expiryDate, remark
    } = req.body

    const formattedDob = new Date(dateOfBirth).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formattedJoiningD = new Date(joiningDate).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formatteRenewD = new Date(renewDate).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formattedExpiryD = new Date(expiryDate).toLocaleDateString('en-IN').split('/').reverse().join('-');

    const query = 'CALL adddriver(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@message)'
    const result = await db.query(query, [
      name.trim(), correspondenceAddress, formattedDob, telephone, fatherName, referencedBy, eyeSight,
      licenseNo, licenseType, remark, permanentAddress, qualification, formattedJoiningD,
      bloodGroup, formatteRenewD, formattedExpiryD
    ])
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      console.log(result[0][0][0])
      return res.status(200).json(result[0][0][0])
    }
  } catch (error) {
    console.log("Error in adding driver", error);
    return res.status(500).json(error)
  }
};

// Remove a driver
const removeDriver = async (req, res, next) => {
  // if (!req.params.id) {
  //   return res.status(200).json({ message: "Driver ID is required!" });
  // }

  // Driver.findByIdAndUpdate(
  //   req.params.id,
  //   {
  //     $set: {
  //       active: false,
  //       updatedBy: req.body.updatedBy,
  //     },
  //   },
  //   { new: true },
  //   (error, data) => {
  //     if (error) {
  //       res.status(200).json({ message: error.message });
  //     } else {
  //       res.json({ id: data._id });
  //     }
  //   }
  // );
  try {
    const id = req.params.id
    const query = 'CALL softdeletedriver(?,@message)'
    const result = await db.query(query, id)
    if (!result && !result[0]) {
      return res.status(200).json({ message: "Error in delete driver" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Error in delete driver", error)
    return res.status(500).json(error)
  }
};

// Update a driver
const updateDriver = async (req, res, next) => {
  try {
    const {
      driver_id, driver_name, corresp_address, date_of_birth, telephoneno, father_name,
      referenceby, eyesight, licenseno, license_type, remarks, permanat_address,
      qualification, mobileno, joining_date, blood_group, renewdate, expiry,
      branch
    } = req.body

    const formattedDob = new Date(date_of_birth).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formattedJoiningD = new Date(joining_date).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formatteRenewD = new Date(renewdate).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formattedExpiryD = new Date(expiry).toLocaleDateString('en-IN').split('/').reverse().join('-');

    const query = 'CALL updatedriver(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@message)'
    const result = await db.query(query, [
      driver_id, driver_name, corresp_address, formattedDob, telephoneno, father_name,
      referenceby, eyesight, licenseno, license_type, remarks, permanat_address,
      qualification, mobileno, formattedJoiningD, blood_group, formatteRenewD, formattedExpiryD,
      branch
    ])
    if (!result) {
      return res.status(200).json({ message: "Error in updating driver" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    res.status(500).json(error)
  }
};


// Get suppliers by page
const getSuppliersByPage = async (req, res, next) => {
  try {
    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    const query = 'CALL getsupplierlistbypage(?,?)'
    const result = await db.query(query, [start_index, counts])
    let supplier = result[0][0]
    const total = supplier.length > 0 ? supplier[0].total_count : 0
    if (supplier) {
      if (supplier.length > 0) {
        return res.status(200).json({
          supplier: supplier,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting suppliers", error);
    return res.status(500).json(error)
  }
};


// Get suppliers by search
const getSuppliersBySearch = async (req, res, next) => {
  try {
    const { filterData } = req.body.temp

    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const offset = page * pageSize;

    const query = 'CALL getsupplierlistbysearch(?)'
    const result = await db.query(query, [filterData.trim()])
    let supplier = result[0][0]
    const total = supplier.length > 0 ? supplier[0].total_count : 0
    if (supplier) {
      if (supplier.length > 0) {
        const paginatedarticles = supplier.slice(offset, offset + pageSize);
        return res.status(200).json({
          supplier: paginatedarticles,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting suppliers", error);
    return res.status(500).json(error)
  }
};

// Get suppliers
const getSuppliers = async (req, res, next) => {
  try {
    const query = 'CALL getallsuppliers()'
    const result = await db.query(query);
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {
    console.log("Error in adding vehicle type", error);
    return res.status(500).json(error)
  }
};

const getSuppliersByType = (req, res, next) => {
  if (!req.body.supplierType) {
    return res.status(200).json({ message: "Supplier type is required!" });
  }
  Supplier.find({ type: req.body.supplierType?.trim?.(), active: true }).exec(
    (error, suppliers) => {
      if (error) {
        return res.status(200).json({
          message: "Error fetching suppliers!",
        });
      } else {
        res.json(suppliers);
      }
    }
  );
};

// Get a supplier
const getSupplier = async (req, res, next) => {
  const supplierId = req.params.id
  try {
    const query = 'CALL getsupplierbyid(?)'
    const result = await db.query(query, supplierId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching supplier data" })
    }
    const finalObject = {
      supplier: result[0][0][0],
      contact_person: result[0][1]
    }
    return res.status(200).json(finalObject)
  } catch (error) {
    console.log("Internal Server Error", error)
    return res.status(500).json(error)
  }
};

// Add a supplier
const addSupplier = async (req, res, next) => {
  try {
    const {
      name, type, address, state, city, phone, email, panNo, vendorCode, vatNo, cstNo, eccNo,
      openingBalance, openingBalanceType, openingBalanceDate, closingBalance,
      closingBalanceDate, closingBalanceType, contactPerson
    } = req.body

    const formatteOpenBalD = new Date(openingBalanceDate).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formatteCloseBalD = new Date(closingBalanceDate).toLocaleDateString('en-IN').split('/').reverse().join('-');

    const query1 = 'CALL insert_supplier(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@message,@inserted_id)'
    const result1 = await db.query(query1, [
      name.trim(), type, address, state, city, phone, email, panNo, vendorCode, vatNo, cstNo, eccNo,
      openingBalance, openingBalanceType, formatteOpenBalD, closingBalance, closingBalanceType,
      formatteCloseBalD
    ])

    const inserted_id = result1[0][1][0].inserted_id

    // name address designation email phone
    if (inserted_id != null && Array.isArray(contactPerson)) {
      const supplierId = inserted_id;
      const query2 = 'call insertSupplierContPerDetails(?,?,?,?,?,?)'
      const promises = contactPerson.map((contact) => {
        return db.query(query2, [supplierId, contact.person_name, contact.address, contact.designation, contact.emailid, contact.phone])
      })

      try {
        await Promise.all(promises);
        // console.log("All contact persons add successfully")
      } catch (error) {
        console.log("Error in adding tax details", error)
      }
    }
    return res.status(200).json(result1[0][0][0])
  } catch (error) {
    console.log("Error in adding vehicles", error);
    return res.status(500).json(error)
  }
};


const getSupplierContactPerson = async (req, res, next) => {
  const supplierId = req.params.id
  try {
    const query = 'CALL getsuppliercontactperbyid(?)'
    const result = await db.query(query, supplierId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching supplier contact person data" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    return res.status(500).json(error)
  }
};


// Update a supplier
const updateSupplier = async (req, res, next) => {
  try {
    const {
      supplier_id, name, type, address, state, city, phone, email, panNo,
      vendorCode, vatNo, cstNo, eccNo, contactPerson
    } = req.body

    const query1 = 'CALL updatesupplier(?,?,?,?,?,?,?,?,?,?,?,?,?,@message)'
    const result1 = await db.query(query1, [
      supplier_id, name, type, address, state, city, phone, email, panNo,
      vendorCode, vatNo, cstNo, eccNo
    ])

    const supplierId = supplier_id

    // name address designation email phone
    if (supplierId != null && Array.isArray(contactPerson)) {
      const query2 = 'call insertSupplierContPerDetails(?,?,?,?,?,?)'
      const promises = contactPerson.map((contact) => {
        return db.query(query2, [supplierId, contact.person_name, contact.address, contact.designation, contact.emailid, contact.phone])
      })

      try {
        await Promise.all(promises);
        // console.log("All contact persons add successfully")
      } catch (error) {
        console.log("Error in adding tax details", error)
      }
    }
    return res.status(200).json(result1[0][0])
  } catch (error) {
    console.log("Error in adding vehicles", error);
    return res.status(500).json(error)
  }
};

// Remove a supplier
const removeSupplier = async (req, res, next) => {
  // if (!req.params.id) {
  //   return res.status(200).json({ message: "Supplier ID is required!" });
  // }
  // Supplier.findByIdAndUpdate(
  //   req.params.id,
  //   {
  //     $set: {
  //       active: false,
  //       updatedBy: req.body.updatedBy,
  //     },
  //   },
  //   { new: true },
  //   (error, data) => {
  //     if (error) {
  //       res.status(200).json({ message: error.message });
  //     } else {
  //       res.json({ id: data._id });
  //     }
  //   }
  // );

  try {
    const id = req.params.id
    const query = 'CALL softdeletesuppliers(?,@message)'
    const result = await db.query(query, id)
    if (!result && !result[0]) {
      return res.status(200).json({ message: "Error in delete Supplier" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Error in delete Supplier", error)
    return res.status(500).json(error)
  }
};

const getVehicleTypesByPage = async (req, res, next) => {

  try {
    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    const query = 'CALL getvehicletypelistbypage(?,?)'
    const result = await db.query(query, [start_index, counts])
    let vehicletypes = result[0][0]
    const total = vehicletypes.length > 0 ? vehicletypes[0].total_count : 0
    if (vehicletypes) {
      if (vehicletypes.length > 0) {
        return res.json({
          vehicletypes: vehicletypes,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting vehicle types", error);
    return res.status(500).json(error)
  }
};

// Get vehicle types
const getVehicleTypesBySearch = async (req, res, next) => {
  try {
    const { filterData } = req.body.temp

    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const offset = page * pageSize;

    const query = 'CALL getvehicletypeslistbysearch(?)'
    const result = await db.query(query, [filterData.trim()])
    let vehicletypes = result[0][0]
    const total = vehicletypes.length > 0 ? vehicletypes[0].total_count : 0
    if (vehicletypes) {
      if (vehicletypes.length > 0) {
        const paginatedarticles = vehicletypes.slice(offset, offset + pageSize);
        return res.json({
          vehicletypes: paginatedarticles,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting vehicle types", error);
    return res.status(500).json(error)
  }
};

// Get vehicle types
const getVehicleTypes = async (req, res, next) => {
  try {
    const query = 'CALL getallvehicletypes()'
    const result = await db.query(query);
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {
    console.log("Error in adding vehicle type", error);
    return res.status(500).json(error)
  }
};

// Get a vehicle type
const getVehicleType = async (req, res, next) => {
  const vehicletId = req.params.id
  try {
    const query = 'CALL getvehicletypebyid(?)'
    const result = await db.query(query, vehicletId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching vehicle type data" })
    }
    return res.status(200).json(result[0][0][0])
  } catch (error) {
    console.log("Internal Server Error")
    return res.status(500).json(error)
  }
};

// Add a vehicle type
const addVehicleType = async (req, res, next) => {
  try {
    const { type, tyreQuantity } = req.body
    const query = 'CALL addvehicletype(?,?,@message)'
    const result = await db.query(query, [type.trim(), tyreQuantity])
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      console.log(result[0][0][0])
      return res.status(200).json(result[0][0][0])
    }
  } catch (error) {
    console.log("Error in adding vehicle type", error);
    return res.status(500).json(error)
  }
};

// Remove a vehicle type
const removeVehicleType = async (req, res, next) => {
  try {
    const id = req.params.id
    const query = 'CALL softdeletevehicletype(?,@message)'
    const result = await db.query(query, id)
    if (!result && !result[0]) {
      return res.status(200).json({ message: "Error in delete vehicle type" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Error in delete vehicle type", error)
    return res.status(500).json(error)
  }
};

// Update a vehicle type
const updateVehicleType = async (req, res, next) => {
  try {
    const {
      vt_id, vehicle_type, tyre_qty
    } = req.body
    const query = 'CALL updatevehicletype(?,?,?,@message)'
    const result = await db.query(query, [
      vt_id, vehicle_type, tyre_qty
    ])
    if (!result) {
      return res.status(200).json({ message: "Error in updating employee" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    res.status(500).json(error)
  }
};

// Get vehicles
const getVehicles = async (req, res, next) => {
  // Vehicle.aggregate([
  //   { $match: { active: true } },
  //   {
  //     $addFields: {
  //       vehicleTypeId: {
  //         $cond: {
  //           if: { $eq: ["$vehicleType", ""] }, // Check if vehicleType is empty string
  //           then: null, // or any default value you prefer
  //           else: { $toObjectId: "$vehicleType" } // Convert non-empty string to ObjectId
  //         }
  //       },
  //     },
  //   },
  //   {
  //     $addFields: {
  //       supplierId: { $toObjectId: "$owner" },
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "vehicleType",
  //       localField: "vehicleTypeId",
  //       foreignField: "_id",
  //       as: "vehicleType",
  //     },
  //   },
  //   { $unwind: { path: "$vehicleType", preserveNullAndEmptyArrays: true } },
  //   {
  //     $lookup: {
  //       from: "supplier",
  //       localField: "supplierId",
  //       foreignField: "_id",
  //       as: "owner",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       vehicleType: "$vehicleType.type",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       name: "$owner.name",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       address: "$owner.address",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       city: "$owner.city",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       phone: "$owner.phone",
  //     },
  //   },
  //   { $sort: { createdAt: -1 } },
  //   {
  //     $project: {
  //       _id: 1,
  //       vehicleNo: 1,
  //       name: 1,
  //       address: 1,
  //       city: 1,
  //       phone: 1,
  //       vehicleType: 1,
  //     },
  //   },
  // ])
  //   .exec((error, vehicles) => {
  //     if (error) {
  //       return res.status(200).json({
  //         message: "Error fetching vehicles!",
  //       });
  //     } else {
  //       res.json(vehicles);
  //     }
  //   });
  try {
    const query = 'CALL getallvehicles()'
    const result = await db.query(query)
    if (result) {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {
    console.log("Error in getVehcile : ", error);
    return res.status(500).json(error)
  }
};

// Get vehicles
const getVehicleList = (req, res, next) => {
  Vehicle.aggregate([
    { $match: { active: true } },

    {
      $addFields: {
        vehicleTypeId: {
          $cond: {
            if: { $eq: ["$vehicleType", ""] }, // Check if vehicleType is empty string
            then: null, // or any default value you prefer
            else: { $toObjectId: "$vehicleType" } // Convert non-empty string to ObjectId
          }
        },
      },
    },
    {
      $addFields: {
        supplierId: { $toObjectId: "$owner" },
      },
    },
    {
      $lookup: {
        from: "vehicleType",
        localField: "vehicleTypeId",
        foreignField: "_id",
        as: "vehicleType",
      },
    },
    { $unwind: { path: "$vehicleType", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "supplier",
        localField: "supplierId",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        vehicleType: "$vehicleType.type",
      },
    },
    {
      $addFields: {
        ownerName: "$owner.name",
      },
    },
    {
      $addFields: {
        ownerAddress: "$owner.address",
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        vehicleNo: 1,
        ownerName: 1,
        ownerAddress: 1,
        vehicleType: 1,
      },
    },
  ]).exec((error, vehicles) => {
    if (error) {
      return res.status(200).json({
        message: "Error fetching vehicles!",
      });
    } else {
      res.json(vehicles);
    }
  });
};


// Get vehicles by page
const getVehicleListByPage = async (req, res, next) => {
  try {

    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    const query = 'CALL getvehiclelistbypage(?,?)'
    const result = await db.query(query, [start_index, counts])
    let vehicle = result[0][0]
    const total = vehicle.length > 0 ? vehicle[0].total_count : 0
    if (vehicle) {
      if (vehicle.length > 0) {

        return res.json({
          vehicle: vehicle,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting vehicles", error);
    return res.status(500).json(error)
  }
};


// Get vehicles By Search
const getVehicleListBySearch = async (req, res, next) => {
  try {
    const { filterData } = req.body.temp

    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const offset = page * pageSize;

    const query = 'CALL getvehiclelistbysearch(?)'
    const result = await db.query(query, [filterData.trim()])
    let vehicle = result[0][0]
    const total = vehicle.length > 0 ? vehicle[0].total_count : 0
    if (vehicle) {
      if (vehicle.length > 0) {
        const paginatedarticles = vehicle.slice(offset, offset + pageSize);
        return res.json({
          vehicle: paginatedarticles,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting vehicles", error);
    return res.status(500).json(error)
  }
};

// Get a vehicle
const getVehicle = async (req, res, next) => {
  const vehicleId = req.params.id
  try {
    const query = 'CALL getvehiclebyid(?)'
    const result = await db.query(query, vehicleId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching vehicle data" })
    }
    const finalObject = {
      vehicle: result[0][0][0],
      tax_details: result[0][1]
    }
    return res.status(200).json(finalObject)
  } catch (error) {
    console.log("Internal Server Error", error)
    return res.status(500).json(error)
  }
};

// Add a vehicle
const addVehicle = async (req, res, next) => {
  try {
    const { owner, vehicleType, vehicleNo, make, capacity, regDate, expDate, pucExpDate, body,
      chassisNo, engineNo, pucNo, description, taxDetails
    } = req.body

    const formattedRegisterD = new Date(regDate).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formattedExpiryD = new Date(expDate).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formattePucExpD = new Date(pucExpDate).toLocaleDateString('en-IN').split('/').reverse().join('-');

    const query1 = 'CALL insertvehicledetails(?,?,?,?,?,?,?,?,?,?,?,?,?,@message,@inserted_id)'
    const result1 = await db.query(query1, [
      owner, vehicleNo.trim(), make, formattedRegisterD, engineNo,
      vehicleType, capacity, chassisNo, description,
      formattedExpiryD, pucNo, formattePucExpD, body
    ])
    const inserted_id = result1[0][1][0].inserted_id

    // taxType,amount,startDate,endDate,description
    if (inserted_id != null && Array.isArray(taxDetails)) {
      const vehicleId = inserted_id;
      const query2 = 'call insert_tax_details(?,?,?,?,?,?)'
      const promises = taxDetails.map((taxd) => {
        const formatteTaxSD = new Date(taxd.tax_start_date).toLocaleDateString('en-IN').split('/').reverse().join('-');
        const formatteTaxED = new Date(taxd.tax_end_date).toLocaleDateString('en-IN').split('/').reverse().join('-');
        return db.query(query2, [vehicleId, taxd.tax_type, formatteTaxSD, taxd.description, taxd.amount, formatteTaxED])
      })

      try {
        await Promise.all(promises);
        // console.log("All tax details add successfully")
      } catch (error) {
        console.log("Error in adding tax details", error)
      }
    }
    return res.status(200).json(result1[0][0][0])
  } catch (error) {
    console.log("Error in adding vehicles", error);
    return res.status(500).json(error)
  }
};


const getVehicleTaxDetails = async (req, res, next) => { // new create
  const vehicleId = req.params.id
  try {
    const query = 'CALL findvehicletaxdetails(?)'
    const result = await db.query(query, vehicleId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching vehicles tax details" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    return res.status(500).json(error)
  }
};


// Update a vehicle
const updateVehicle = async (req, res, next) => {
  try {
    const {
      vehicle_id, owner, vehicleType, vehicleno, make, capacity, reg_date, vehicleexpdate,
      pucexpdate, body, chasisno, engineno, pucno, description, taxDetails
    } = req.body

    const formattedRegisterD = new Date(reg_date).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formattedExpiryD = new Date(vehicleexpdate).toLocaleDateString('en-IN').split('/').reverse().join('-');
    const formattePucExpD = new Date(pucexpdate).toLocaleDateString('en-IN').split('/').reverse().join('-');

    const query1 = 'CALL updatevehicle(?,?,?,?,?,?,?,?,?,?,?,?,?,?,@message)'
    const result1 = await db.query(query1, [
      vehicle_id, owner, vehicleno, make, formattedRegisterD, engineno, vehicleType,
      capacity, chasisno, description, formattedExpiryD, pucno, formattePucExpD, body
    ])
    const vehicleId = vehicle_id;

    // taxType,amount,startDate,endDate,description
    if (vehicleId != null && Array.isArray(taxDetails)) {
      const query2 = 'call insert_tax_details(?,?,?,?,?,?)'
      const promises = taxDetails.map((taxd) => {
        const formatteTaxSD = new Date(taxd.tax_start_date).toLocaleDateString('en-IN').split('/').reverse().join('-');
        const formatteTaxED = new Date(taxd.tax_end_date).toLocaleDateString('en-IN').split('/').reverse().join('-');
        return db.query(query2, [vehicleId, taxd.tax_type, formatteTaxSD, taxd.description, taxd.amount, formatteTaxED])
      })

      try {
        await Promise.all(promises);
        // console.log("All tax details add successfully")
      } catch (error) {
        console.log("Error in adding tax details", error)
      }
    }
    return res.status(200).json(result1[0][0])
  } catch (error) {
    console.log("Error in updaing vehicles", error);
    return res.status(500).json(error)
  }
};

// Remove a vehicle
const removeVehicle = async (req, res, next) => {
  // if (!req.params.id) {
  //   return res.status(200).json({ message: "Vehicle ID is required!" });
  // }
  // Vehicle.findByIdAndRemove(req.params.id, (error, data) => {
  //   if (error) {
  //     res.status(200).json({ message: error.message });
  //   } else {
  //     res.json({ id: data._id });
  //   }
  // });
  try {
    const id = req.params.id
    const query = 'CALL softdeletevehicle(?,@message)'
    const result = await db.query(query, id)
    if (!result && !result[0]) {
      return res.status(200).json({ message: "Error in delete vehicle" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Error in delete vehicle", error)
    return res.status(500).json(error)
  }
};


// Get Banks By Page
const getBanksByPage = async (req, res, next) => {
  try {
    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    const query = 'CALL getbankslistbypage(?,?)'
    const result = await db.query(query, [start_index, counts])
    let bank = result[0][0]
    const total = bank.length > 0 ? bank[0].total_count : 0
    if (bank) {
      if (bank.length > 0) {

        return res.json({
          bank: bank,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting bank", error);
    return res.status(500).json(error)
  }
};


// Get Banks By Search
const getBanksBySeach = async (req, res, next) => {
  try {
    const { filterData } = req.body.temp

    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const offset = page * pageSize;

    const query = 'CALL getbankslistbysearch(?)'
    const result = await db.query(query, [filterData.trim()])
    let bank = result[0][0]
    const total = bank.length > 0 ? bank[0].total_count : 0
    if (bank) {
      if (bank.length > 0) {
        const paginatedarticles = bank.slice(offset, offset + pageSize);
        return res.json({
          bank: paginatedarticles,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting bank", error);
    return res.status(500).json(error)
  }
};

// Get banks
const getBanks = async (req, res, next) => {

  try {
    const query = 'CALL getallbank()'
    const result = await db.query(query)
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {
    console.log("Error in adding bank", error);
    return res.status(500).json(error)
  }
};

// Get a bank
const getBank = async (req, res, next) => {
  const bankId = req.params.id
  try {
    const query = 'CALL getbankbyid(?)'
    const result = await db.query(query, bankId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching bank data" })
    }
    return res.status(200).json(result[0][0][0])
  } catch (error) {
    console.log("Internal Server Error")
    return res.status(500).json(error)
  }
};

// Add a bank
const addBank = async (req, res, next) => {

  try {
    const { name, branchName, branchCode, address, ifsc, micr, phone, email } = req.body
    const query = 'CALL addbank(?,?,?,?,?,?,?,?,@message)'
    const result = await db.query(query, [
      name, branchCode, branchName, address, ifsc, micr, phone, email
    ])
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      return res.status(200).json(result[0][0][0])
    }
  } catch (error) {
    console.log("Error in adding bank", error);
    return res.status(500).json(error)
  }
};

// Update a bank
const updateBank = async (req, res, next) => {
  try {
    const {
      bank_id, bank_name, branch_name, branch_code, address,
      ifsc_code, micr_code, telephone, emailid
    } = req.body
    const query = 'CALL updatebank(?,?,?,?,?,?,?,?,?,@message)'
    const result = await db.query(query, [
      bank_id, bank_name, branch_name, branch_code, address,
      ifsc_code, micr_code, telephone, emailid
    ])
    if (!result) {
      return res.status(200).json({ message: "Error in updating place" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    res.status(500).json(error)
  }
};

// Remove a bank
const removeBank = async (req, res, next) => {
  // if (!req.params.id) {
  //   return res.status(200).json({ message: "Bank ID is required!" });
  // }

  // Bank.findByIdAndUpdate(
  //   req.params.id,
  //   {
  //     $set: {
  //       active: false,
  //       updatedBy: req.body.updatedBy,
  //     },
  //   },
  //   { new: true },
  //   (error, data) => {
  //     if (error) {
  //       res.status(200).json({ message: error.message });
  //     } else {
  //       res.json({ id: data._id });
  //     }
  //   }
  // );

  try {
    const id = req.params.id
    const query = 'CALL softdeletebanklist(?,@message)'
    const result = await db.query(query, id)
    if (!result && !result[0]) {
      return res.status(200).json({ message: "Error in delete bank" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Error in delete bank", error)
    return res.status(500).json(error)
  }
};

// Get banks
const getBankAccounts = async (req, res, next) => {
  BankAccount.find({ active: true })
    .sort("-createdAt")
    .exec((error, banks) => {
      if (error) {
        return res.status(200).json({
          message: "Error fetching bank accounts!",
        });
      } else {
        res.json(banks);
      }
    });
};


// Get banks by page
const getBankAccountListByPage = async (req, res, next) => {
  try {
    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    const query = 'CALL getbankaccountlistbypage(?,?)'
    const result = await db.query(query, [start_index, counts])
    let bankAccount = result[0][0]
    const total = bankAccount.length > 0 ? bankAccount[0].total_count : 0
    if (bankAccount) {
      if (bankAccount.length > 0) {

        return res.json({
          bankAccount: bankAccount,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting bank account list", error);
    return res.status(500).json(error)
  }
};


// Get banks 
const getBankAccountListBySearch = async (req, res, next) => {
  try {
    const { filterData } = req.body.temp

    const page = parseInt(req.body.temp.page) || 0;
    const pageSize = parseInt(req.body.temp.pageSize) || 10;
    const offset = page * pageSize;

    const query = 'CALL getbankaccountlistbysearch(?)'
    const result = await db.query(query, [filterData.trim()])
    let bankAccount = result[0][0]
    const total = bankAccount.length > 0 ? bankAccount[0].total_count : 0
    if (bankAccount) {
      if (bankAccount.length > 0) {
        const paginatedarticles = bankAccount.slice(offset, offset + pageSize);
        return res.json({
          bankAccount: paginatedarticles,
          total: total
        });
      } else {
        return res.status(200).json({ message: "No data found" })
      }
    } else {
      return res.status(200).json({ message: "No data found" })
    }
  } catch (error) {
    console.log("Error in getting bank account list", error);
    return res.status(500).json(error)
  }
};

// Get a bank
const getBankAccount = async (req, res, next) => {
  const bankaccountId = req.params.id
  try {
    const query = 'CALL getbankaccountbyid(?)'
    const result = await db.query(query, bankaccountId)
    if (!result) {
      return res.status(200).json({ message: "Error in fetching bank account data" })
    }
    return res.status(200).json(result[0][0][0])
  } catch (error) {
    console.log("Internal Server Error")
    return res.status(500).json(error)
  }
};

// Add a bank
const addBankAccount = async (req, res, next) => {
  try {
    const { bank, ifsc, accountType, accountHolder, customerId, accountNo, openingBalance } = req.body
    const query = 'CALL addbankaccount(?,?,?,?,?,?,@message)'
    const result = await db.query(query, [
      bank, accountType, accountHolder, customerId, accountNo, openingBalance
    ])
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      return res.status(200).json(result[0][0][0])
    }
  } catch (error) {
    console.log("Error in adding bank account", error);
    return res.status(500).json(error)
  }
};

// Update a bank
const updateBankAccount = async (req, res, next) => {
  try {
    const {
      account_id, bank, account_type, account_holder_name,
      customer_id, account_number, opening_balance
    } = req.body
    const query = 'CALL updatebankaccount(?,?,?,?,?,?,?,@message)'
    const result = await db.query(query, [
      account_id, bank, account_type, account_holder_name,
      customer_id, account_number, opening_balance
    ])
    if (!result) {
      return res.status(200).json({ message: "Error in updating bank account" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    res.status(500).json(error)
  }
};

// Remove a bank
const removeBankAccount = async (req, res, next) => {
  // if (!req.params.id) {
  //   return res.status(200).json({ message: "Bank account ID is required!" });
  // }

  // BankAccount.findByIdAndUpdate(
  //   req.params.id,
  //   {
  //     $set: {
  //       active: false,
  //       updatedBy: req.body.updatedBy,
  //     },
  //   },
  //   { new: true },
  //   (error, data) => {
  //     if (error) {
  //       res.status(200).json({ message: error.message });
  //     } else {
  //       res.json({ id: data._id });
  //     }
  //   }
  // );
  try {
    const id = req.params.id
    const query = 'CALL softdeletebankaccount(?,@message)'
    const result = await db.query(query, id)
    if (!result && !result[0]) {
      return res.status(200).json({ message: "Error in delete bank account" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Error in delete bank account", error)
    return res.status(500).json(error)
  }
};

const getLastEmployee = async (req, res) => {
  try {
    const query = 'CALL getlastemployee()'
    const result = await db.query(query)
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {
    console.log("Error in getting last employee", error);
    return res.status(500).json(error)
  }
};

const getLastDriver = async (req, res) => {
  try {
    const query = 'CALL getlastdriver()'
    const result = await db.query(query)
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {
    console.log("Error in getting last driver", error);
    return res.status(500).json(error)
  }
};

const getRateListWithPagination = (req, res) => {
  if (!req.body.pagination.page || !req.body.pagination.limit) {
    return res.status(200).json({ message: "Pagination is required!" });
  }

  const limit = req.body.pagination.limit || 100;
  const start = (req.body.pagination.page - 1) * limit;
  const end = req.body.pagination.page * limit;

  RateMaster.find({ active: true })
    .sort("-createdAt")
    .exec((rmError, rateList) => {
      if (rmError) {
        return res.status(200).json({
          message: rmError.message,
        });
      } else {
        res.json({
          rateList: rateList.slice(start, end),
          count: rateList?.length,
        });
      }
    });
};

const addToRateMaster = (req, res) => {
  if (!req.body.customer && !req.body.customerName) {
    return res.status(200).json({ message: "Customer is required!" });
  }

  RateMaster.findOne(
    {
      customer: {
        $regex: getRegex(req.body.customer?.trim?.()),
        $options: "i",
      },

      active: true,
    },
    (foundErr, foundRateList) => {
      if (foundErr) {
        return res.status(200).json({ message: foundErr.message });
      }
      if (foundRateList) {
        return res.status(200).json({
          message: `Rate list for ${req.body.customerName} already exist!`,
        });
      }
      if (!foundErr && !foundRateList) {
        if (req.body.rates.length) {
          req.body.rates.forEach(async (rate, index) => {
            try {
              const foundArticle = await Article.findOne({
                name: {
                  $regex: getRegex(rate.article?.toUpperCase()?.trim?.()),
                  $options: "i",
                },
              });
              if (foundArticle) {
                rate.article = foundArticle.name?.toUpperCase();
                if (index === req.body.rates.length - 1) {
                  const rateList = new RateMaster({
                    customer: req.body.customer,
                    customerName: req.body.customerName
                      ?.toUpperCase()
                      ?.trim?.(),
                    rates: req.body.rates,
                    createdBy: req.body.createdBy,
                  });
                  RateMaster.create(rateList, (error, data) => {
                    if (error) {
                      if (error.code === 11000) {
                        return res.status(200).json({
                          message: `Rate Master with customer name (${rateList.customerName}) already exist!`,
                        });
                      }
                      return res.status(200).json({ message: error.message });
                    } else {
                      return res.send(data);
                    }
                  });
                }
              } else {
                const article = new Article({
                  name: rate.article?.toUpperCase(),
                  createdBy: req.body.createdBy,
                });
                const createdArticle = await Article.create(article);
                if (createdArticle) {
                  rate.article = createdArticle.name?.toUpperCase();
                  if (index === req.body.rates.length - 1) {
                    const rateList = new RateMaster({
                      customer: req.body.customer,
                      customerName: req.body.customerName
                        ?.toUpperCase()
                        ?.trim?.(),
                      rates: req.body.rates,
                      createdBy: req.body.createdBy,
                    });
                    if (rateList) {
                      RateMaster.create(rateList, (error, data) => {
                        if (error) {
                          return res.status(200).json({
                            message: error.message,
                          });
                        } else {
                          return res.send(data);
                        }
                      });
                    }
                  }
                }
              }
            } catch (e) {
              return res.status(200).json({ message: e.message });
            }
          });
        } else {
          return res
            .status(200)
            .json({ message: "Rate master list is required" });
        }
      }
    }
  );
};

const getCustomersForRateMaster = async (req, res) => {
  try {
    const allRateMaster = await RateMaster.find({ active: true });
    if (allRateMaster && allRateMaster.length) {
      const customers = allRateMaster.map((rate) => rate.customer);
      const foundCustomers = await Customer.find({
        _id: { $nin: customers },
      });
      if (foundCustomers) {
        return res.send(foundCustomers);
      }
    } else {
      const foundCustomers = await Customer.find({});
      if (foundCustomers) {
        return res.send(foundCustomers);
      }
    }
  } catch (e) {
    return res.status(200).json({ message: e.message });
  }
};

const getRateMasterById = async (req, res) => {
  if (!req.params.id) {
    return res.status(200).json({ message: "Rate master id is required!" });
  }
  try {
    const response = await RateMaster.findById(req.params.id);
    if (response) {
      return res.send(response);
    }
  } catch (e) {
    return res.status(200).json({ message: e.message });
  }
};

const updateRateMaster = (req, res) => {
  if (!req.body.rates.length) {
    return res.status(200).json({ message: "Rate master list is required" });
  }
  if (!req.body._id) {
    return res.status(200).json({ message: "Rate master id is required" });
  }

  RateMaster.findOne(
    {
      customer: {
        $regex: getRegex(req.body.customer?.trim?.()),
        $options: "i",
      },

      active: true,
      _id: { $ne: req.body._id },
    },
    (foundErr, foundRateList) => {
      if (foundErr) {
        return res.status(200).json({ message: foundErr.message });
      }
      if (foundRateList) {
        return res.status(200).json({
          message: `Rate list for ${req.body.customerName} already exist!`,
        });
      }
      const udpatedRates = [];
      req.body.rates.forEach(async (rate) => {
        try {
          const foundArticle = await Article.findOne({
            name: {
              $regex: getRegex(rate.article?.toUpperCase()?.trim?.()),
              $options: "i",
            },
          });
          if (foundArticle) {
            rate.article = foundArticle.name?.toUpperCase();
            udpatedRates.push(rate);
            if (udpatedRates.length === req.body.rates.length) {
              const saveRate = [...udpatedRates];
              RateMaster.findByIdAndUpdate(
                req.body._id,
                {
                  $set: {
                    rates: saveRate,
                    updatedBy: req.body.updatedBy,
                  },
                },
                { new: true },
                (error, data) => {
                  if (error) {
                    return res.status(200).json({ message: error.message });
                  } else {
                    return res.json(data);
                  }
                }
              );
            }
          } else {
            const article = new Article({
              name: rate.article?.toUpperCase(),
              createdBy: req.body.createdBy,
            });
            const createdArticle = await Article.create(article);
            if (createdArticle) {
              rate.article = createdArticle.name?.toUpperCase();
              udpatedRates.push(rate);
            }
            if (udpatedRates.length === req.body.rates.length) {
              const saveRate = [...udpatedRates];
              RateMaster.findByIdAndUpdate(
                req.body._id,
                {
                  $set: {
                    rates: saveRate,
                    updatedBy: req.body.updatedBy,
                  },
                },
                { new: true },
                (error, data) => {
                  if (error) {
                    return res.status(200).json({ message: error.message });
                  } else {
                    return res.json(data);
                  }
                }
              );
            }
          }
        } catch (e) {
          return res.status(200).json({ message: e.message });
        }
      });
    }
  );
};

const getRateMasterByCustomer = async (req, res) => {
  if (!req.params.id) {
    return res.status(200).json({ message: "Customer id is required" });
  }
  try {
    const rateMaster = await RateMaster.findOne({ customer: req.params.id });
    return res.send({ rateMaster: rateMaster });
  } catch (e) {
    return res.status(200).json({ message: e.message });
  }
};

// Add a TransactionPrefix
const addTransactionPrefix = (req, res, next) => {
  const transactionPrefix = new TransactionPrefix({
    name: req.body.name?.toUpperCase?.(),
    prefix: req.body.prefix,
    current: 1,
    createdBy: req.body.createdBy,
  });

  TransactionPrefix.findOne(
    {
      name: {
        $regex: getRegex(req.body.name?.trim?.()),
        $options: "i",
      },
    },
    (error, foundPrefix) => {
      if (error) {
        return next(error);
      }
      if (foundPrefix) {
        return res.status(200).json({
          message: `TransactionPrefix with name (${foundPrefix.name}) already exist!`,
        });
      }
      TransactionPrefix.create(transactionPrefix, (error, data) => {
        if (error) {
          return res.send(error);
        } else {
          return res.json(data);
        }
      });
    }
  );
};
const getTransactionPrefix = (req, res, next) => {
  const number = 1;
  LorryReceipt.findOne(
    { lrNo: { $regex: req.params.code?.trim?.() } },
    {},
    { sort: { createdAt: -1 } },
    function (err, lr) {
      if (lr) {
        const currentNum = lr.lrNo?.split("-");
        const numLeadingZeros = parseInt(
          currentNum[currentNum?.length - 1]?.replace(/[^0-9]/g, "")
        );
        return res.send(
          `${req.params.code}-${(numLeadingZeros + 1 + "").padStart(6, "0")}`
        );
      } else {
        return res.send(`${req.params.code}-${(number + "").padStart(6, "0")}`);
      }
    }
  );
};

const getRegex = (str) => `^${str}$`;

module.exports = {
  addBranch,
  getBranches,
  getBranchesListByPage,
  getBranchesBySearch,
  getBranchList,
  getBranch,
  removeBranch,
  updateBranch,
  getPlaces,
  getPlacesListByPage,
  getPlacesBySearch,
  addPlace,
  removePlace,
  updatePlace,
  getPlace,
  addEmployee,
  getEmployees,
  getEmployeesForUserReg,
  getEmployeesByPage,
  getEmployeesBySearch,
  removeEmployee,
  updateEmployee,
  getEmployee,
  getArticles,
  fetchemail,
  getArticlesBySearch,
  getArticlesByPage,
  getArticle,
  addArticle,
  removeArticle,
  updateArticle,
  getCustomers,
  getCustomersLimit,
  getCustomersByPage,
  getCustomersBySearch,
  getCustomersByBranch,
  getCustomer,
  getCustomerContactPerson, // new create
  addCustomer,
  updateCustomer,
  removeCustomer,
  getDrivers,
  getDriversByPage,
  getDriversBySearch,
  getDriver,
  addDriver,
  removeDriver,
  updateDriver,
  getSuppliersByPage,
  getSuppliersBySearch,
  getSuppliers,
  getSuppliersByType,
  getSupplier,
  addSupplier,
  getSupplierContactPerson,
  updateSupplier,
  removeSupplier,
  getVehicleTypesByPage,
  getVehicleTypesBySearch,
  getVehicleTypes,
  getVehicleType,
  addVehicleType,
  removeVehicleType,
  updateVehicleType,
  getVehicles,
  getVehicleList,
  getVehicleListByPage,
  getVehicleListBySearch,
  getVehicle,
  addVehicle,
  getVehicleTaxDetails,
  updateVehicle,
  removeVehicle,
  getBanksByPage,
  getBanksBySeach,
  getBanks,
  getBank,
  addBank,
  updateBank,
  removeBank,
  getBankAccounts,
  getBankAccountListByPage,
  getBankAccountListBySearch,
  getBankAccount,
  addBankAccount,
  updateBankAccount,
  removeBankAccount,
  getLastEmployee,
  getLastDriver,
  getRateListWithPagination,
  addToRateMaster,
  getCustomersForRateMaster,
  getRateMasterById,
  updateRateMaster,
  getRateMasterByCustomer,
  addTransactionPrefix,
  getTransactionPrefix,
  downloadCustomers
};
