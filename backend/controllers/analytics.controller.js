import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalytics = async (req, res, next) => {
    try {
        const analyticsData = await getAnalyticsData();

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.json({
            analyticsData,
            dailySalesData
        })
    } catch (error) {
        console.log("Error in getAnalytics controller", error);
        next(error);
    }
};

const getAnalyticsData = async () => {
    const totalUsers = await User.countDocuments();
    const totalProducs = await Product.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null, // it groups all document together
                totalSales: {$sum: 1},
                totalRevenue: {$sum: "$totalAmount"}
            }
        }
    ]);

    const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0};

    return {
        users: totalUsers,
        products: totalProducs,
        totalSales,
        totalRevenue
    }
};

const getDailySalesData = async (startDate, endDate) => {
    try {
            const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }},
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            {
                $sort: { _id: 1 }
            },
        ]);

        // the output of dailySalesData will look something like this
        // [
        //     {
        //         _id: "2025-07-30",
        //         sales: 12,
        //         revenue: 1450.75
        //     }
        // ]

        const dateArray = getDateInRange(startDate, endDate);
        // console.log(dateArray) ['2025-07-30', '2025-07-31', and so on]

        return dateArray.map(date => {
            const foundDate = dailySalesData.find(item => item._id === date);

            return {
                name: date,
                sales: foundDate?.sales || 0,
                revenue: foundDate?.revenue || 0,
            }
        });
    } catch (error) {
        console.log("Error in getDailySalesData", error);
        throw error;
    }
};

function getDateInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate ) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}