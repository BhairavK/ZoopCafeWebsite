import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| CREATE REVIEW
|--------------------------------------------------------------------------
| POST /api/reviews
|
| Body:
| {
|   "restaurantId": 1,
|   "rating": 5,
|   "comment": "Amazing food!"
| }
|
| OR
|
| {
|   "menuItemId": 29,
|   "rating": 4,
|   "comment": "Really good pizza"
| }
|--------------------------------------------------------------------------
*/

export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      restaurantId,
      menuItemId,
      rating,
      comment,
    } = req.body;

    // A review must target either a restaurant or a menu item
    if ((restaurantId && menuItemId) || (!restaurantId && !menuItemId)) {
      return res.status(400).json({
        success: false,
        message: "Provide either restaurantId or menuItemId",
      });
    }

    // Validate rating
    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    // Validate comment if provided
    if (comment !== undefined && comment !== null) {
      if (typeof comment !== "string") {
        return res.status(400).json({
          success: false,
          message: "Comment must be a string",
        });
      }

      if (comment.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Comment cannot exceed 1000 characters",
        });
      }
    }

    // Check restaurant exists
    if (restaurantId) {
      const restaurant = await prisma.restaurant.findUnique({
        where: {
          id: Number(restaurantId),
        },
      });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }
    }

    // Check menu item exists and is available
    if (menuItemId) {
      const menuItem = await prisma.menuItem.findUnique({
        where: {
          id: Number(menuItemId),
        },
        select: {
          id: true,
          name: true,
          isAvailable: true,
        },
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: "This menu item is currently unavailable",
        });
      }
    }

    // Check for existing review
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        ...(restaurantId
          ? { restaurantId: Number(restaurantId) }
          : { menuItemId: Number(menuItemId) }),
      },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this item",
      });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        restaurantId: restaurantId ? Number(restaurantId) : null,
        menuItemId: menuItemId ? Number(menuItemId) : null,
        rating,
        comment: comment?.trim() || null,
      },

      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET RESTAURANT REVIEWS
|--------------------------------------------------------------------------
| GET /api/reviews/restaurant
|--------------------------------------------------------------------------
*/

export const getRestaurantReviews = async (req, res) => {
  try {
    const restaurantId = Number(req.query.restaurantId);

    if (!restaurantId || Number.isNaN(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "Valid restaurantId is required",
      });
    }

    const reviews = await prisma.review.findMany({
      where: {
        restaurantId,
        status: "APPROVED",
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const data = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        name: review.user.name,
      },
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching restaurant reviews:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant reviews",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET MENU ITEM REVIEWS
|--------------------------------------------------------------------------
| GET /api/reviews/item/:menuItemId
|--------------------------------------------------------------------------
*/

export const getMenuItemReviews = async (req, res) => {
  try {
    const menuItemId = Number(req.params.menuItemId);

    if (!menuItemId || Number.isNaN(menuItemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
    }

    const reviews = await prisma.review.findMany({
      where: {
        menuItemId,
        status: "APPROVED",
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,

        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const data = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        name: review.user.name,
      },
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching menu item reviews:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch menu item reviews",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET MY REVIEWS
|--------------------------------------------------------------------------
| GET /api/reviews/me
|--------------------------------------------------------------------------
*/

export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const reviews = await prisma.review.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        restaurant: {
          select: {
            name: true,
          },
        },

        menuItem: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const data = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,

      target: review.restaurant
        ? {
            type: "RESTAURANT",
            name: review.restaurant.name,
          }
        : {
            type: "MENU_ITEM",
            id: review.menuItem.id,
            name: review.menuItem.name,
          },
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your reviews",
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE REVIEW
|--------------------------------------------------------------------------
| PATCH /api/reviews/:id
|--------------------------------------------------------------------------
*/

export const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = Number(req.params.id);

    const { rating, comment } = req.body;

    if (!reviewId || Number.isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    if (
      rating !== undefined &&
      (!Number.isInteger(rating) || rating < 1 || rating > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    if (comment !== undefined && comment !== null) {
      if (typeof comment !== "string") {
        return res.status(400).json({
          success: false,
          message: "Comment must be a string",
        });
      }

      if (comment.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Comment cannot exceed 1000 characters",
        });
      }
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId,
      },
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const review = await prisma.review.update({
      where: {
        id: reviewId,
      },

      data: {
        ...(rating !== undefined && { rating }),
        ...(comment !== undefined && {
          comment: comment?.trim() || null,
        }),

        // Editing an approved review sends it back for moderation
        status: "PENDING",
      },

      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error updating review:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};


/*
|--------------------------------------------------------------------------
| DELETE REVIEW
|--------------------------------------------------------------------------
| DELETE /api/reviews/:id
|--------------------------------------------------------------------------
*/

export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = Number(req.params.id);

    if (!reviewId || Number.isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId,
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};