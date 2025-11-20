const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const normalizePositiveInt = (value, fallback) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    const floored = Math.floor(parsed);
    return floored > 0 ? floored : fallback;
};

const parsePaginationParams = (input = {}) => {
    const page = normalizePositiveInt(input.page, DEFAULT_PAGE);
    const limit = Math.min(normalizePositiveInt(input.limit, DEFAULT_LIMIT), input.maxLimit || MAX_LIMIT);

    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
};

const buildPageMetadata = ({ total = 0, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT }) => {
    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

    return {
        currentPage: page,
        totalPages,
        perPage: limit,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
};

module.exports = {
    parsePaginationParams,
    buildPageMetadata,
};
