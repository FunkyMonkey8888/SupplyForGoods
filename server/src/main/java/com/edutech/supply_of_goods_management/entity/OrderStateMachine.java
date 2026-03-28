package com.edutech.supply_of_goods_management.entity;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public class OrderStateMachine {
    private static final Map<OrderStatus, Set<OrderStatus>> transitions =
            new EnumMap<>(OrderStatus.class);

    static {
        transitions.put(OrderStatus.PLACED,
                EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED));

        transitions.put(OrderStatus.CONFIRMED,
                EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED));

        transitions.put(OrderStatus.SHIPPED,
                EnumSet.of(OrderStatus.DELIVERED));

        transitions.put(OrderStatus.DELIVERED,
                EnumSet.noneOf(OrderStatus.class));

        transitions.put(OrderStatus.CANCELLED,
                EnumSet.noneOf(OrderStatus.class));
    }

    public static boolean isValidTransition(
            OrderStatus current,
            OrderStatus next
    ) {
        return transitions.get(current).contains(next);
    }
}
