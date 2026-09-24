import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| GET ALL REVIEWS FOR ADMIN
|--------------------------------------------------------------------------
| GET /api/admin/reviews
|--------------------------------------------------------------------------
*/

export const getAllReviews = async (req, res) => {
  try {
    const status = req.query.status;

    const validStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status",
      });
    }

    const reviews = await prisma.review.findMany({
      where: status
        ? {
            status,
          }
        : undefined,

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

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        restaurant: {
          select: {
            id: true,
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

      user: review.user,

      target: review.restaurant
        ? {
            type: "RESTAURANT",
            id: review.restaurant.id,
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
    console.error("Error fetching admin reviews:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE REVIEW STATUS
|--------------------------------------------------------------------------
| PATCH /api/admin/reviews/:id/status
|
| Body:
| {
|   "status": "APPROVED"
| }
|--------------------------------------------------------------------------
*/

export const updateReviewStatus = async (req, res) => {
  try {
    const reviewId = Number(req.params.id);
    const { status } = req.body;

    if (!reviewId || Number.isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const validStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status",
      });
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        id: reviewId,
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
        status,
      },

      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Review ${status.toLowerCase()} successfully`,
      data: review,
    });
  } catch (error) {
    console.error("Error updating review status:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update review status",
    });
  }
};